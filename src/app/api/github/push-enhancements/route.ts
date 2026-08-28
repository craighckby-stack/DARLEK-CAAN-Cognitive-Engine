import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { safeReqJson } from '@/lib/safe-json';
import { sanitizeContent } from '@/lib/scanner';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// List of enhancement files to push to the repository
const ENHANCEMENT_FILES = [
  // API routes
  'src/app/api/chat/route.ts',
  'src/app/api/evolution/propose/route.ts',
  'src/app/api/evolution/coherence-gate/route.ts',
  'src/app/api/evolution/health/route.ts',
  'src/app/api/evolution/debate/route.ts',
  'src/app/api/evolution/analyze-impact/route.ts',
  'src/app/api/evolution/auto-test/route.ts',
  'src/app/api/brain/route.ts',
  'src/app/api/github/write-file/route.ts',
  'src/app/api/github/read-file/route.ts',
  'src/app/api/github/scan/route.ts',
  'src/app/api/github/push-enhancements/route.ts',
  'src/app/api/github/create-repo/route.ts',
  'src/app/api/github/branches/route.ts',
  'src/app/api/setup/test-connection/route.ts',
  // System API
  'src/app/api/system/reboot/route.ts',
  // Lib
  'src/lib/constants.ts',
  'src/lib/types.ts',
  'src/lib/utils.ts',
  'src/lib/db.ts',
  'src/lib/dalek-brain.ts',
  // Components
  'src/components/StatusBar.tsx',
  'src/components/ChatPanel.tsx',
  'src/components/ChatMessage.tsx',
  'src/components/QuickActions.tsx',
  'src/components/DashboardPanel.tsx',
  'src/components/DebateChamber.tsx',
  'src/components/EvolutionLog.tsx',
  'src/components/SaturationMetrics.tsx',
  'src/components/MutationDiffView.tsx',
  'src/components/MutationHistoryPanel.tsx',
  // Pages
  'src/app/page.tsx',
  'src/app/layout.tsx',
  'src/app/globals.css',
  // Schema
  'prisma/schema.prisma',
] as const;

interface CustomFilePayload {
  path?: string;
  content?: string;
}

interface PushEnhancementRequestBody {
  token?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  files?: CustomFilePayload[];
}

interface PushDetail {
  file: string;
  success: boolean;
  error?: string;
}

interface GitTreeItem {
  path: string;
  mode: string;
  type: string;
  content: string;
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'online', service: 'GITHUB_PUSH_ENHANCEMENTS_API' });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await safeReqJson(req, {})) as PushEnhancementRequestBody;
    const { token, owner, repo, branch, files } = body;

    if (!token || !owner || !repo || !branch) {
      return NextResponse.json(
        { error: 'All fields required: token, owner, repo, branch' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // Verify repository exists; auto-create if missing (404)
    const verifyRepoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });

    if (verifyRepoRes.status === 404) {
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: repo,
          private: false,
          auto_init: true,
        }),
      });
      if (!createRes.ok) {
        const createErr = await createRes.text();
        return NextResponse.json(
          { error: `Failed to auto-create missing repository ${repo}: ${createErr}` },
          { status: 400 }
        );
      }
      await new Promise<void>((resolveTimer) => setTimeout(resolveTimer, 3000));
    }

    // Resolve branch reference commit SHA
    let refSha: string | null = null;
    const refUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`;
    const refRes = await fetch(refUrl, { headers });

    if (refRes.ok) {
      const refData = await refRes.json();
      refSha = refData.object?.sha ?? null;
    } else if (refRes.status === 404) {
      const mainRefUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`;
      const mainRefRes = await fetch(mainRefUrl, { headers });

      if (mainRefRes.ok) {
        const mainRefData = await mainRefRes.json();
        const mainSha: string | undefined = mainRefData.object?.sha;

        if (mainSha) {
          const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              ref: `refs/heads/${branch}`,
              sha: mainSha,
            }),
          });
          if (createRefRes.ok) {
            refSha = mainSha;
          }
        }
      }
    }

    let baseTreeSha: string | null = null;
    if (refSha) {
      const commitUrl = `https://api.github.com/repos/${owner}/${repo}/git/commits/${refSha}`;
      const commitRes = await fetch(commitUrl, { headers });
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree?.sha ?? null;
      }
    }

    // Collect files
    const projectRoot = resolve(process.cwd());
    const treeItemsMap = new Map<string, GitTreeItem>();
    const pushDetails: PushDetail[] = [];

    // 1. Process explicit dynamic files payload if provided
    if (Array.isArray(files) && files.length > 0) {
      for (const customFile of files) {
        if (!customFile?.path || typeof customFile.content !== 'string') continue;
        const cleanPath = customFile.path.replace(/^\/+|\/+$/g, '');

        // Sanitize secret tokens/keys before write
        const { sanitized: safeContent } = sanitizeContent(customFile.content);

        // Write locally if path is safely inside project root
        try {
          const localPath = resolve(projectRoot, cleanPath);
          if (localPath.startsWith(projectRoot)) {
            const parentDir = dirname(localPath);
            if (!existsSync(parentDir)) {
              mkdirSync(parentDir, { recursive: true });
            }
            writeFileSync(localPath, safeContent, 'utf-8');
          }
        } catch (diskErr) {
          console.warn(`[Push Enhancements] Local disk write warn for ${cleanPath}:`, diskErr);
        }

        treeItemsMap.set(cleanPath, {
          path: cleanPath,
          mode: '100644',
          type: 'blob',
          content: safeContent,
        });
        pushDetails.push({ file: cleanPath, success: true });
      }
    }

    // 2. Process standard local enhancement files
    for (const filePath of ENHANCEMENT_FILES) {
      const localPath = join(projectRoot, filePath);
      if (!existsSync(localPath)) {
        if (!treeItemsMap.has(filePath)) {
          pushDetails.push({ file: filePath, success: false, error: 'File not found locally' });
        }
        continue;
      }

      try {
        const content = readFileSync(localPath, 'utf-8');
        const { sanitized: safeContent } = sanitizeContent(content);

        treeItemsMap.set(filePath, {
          path: filePath,
          mode: '100644',
          type: 'blob',
          content: safeContent,
        });
        pushDetails.push({ file: filePath, success: true });
      } catch (readErr: unknown) {
        const errorMsg = readErr instanceof Error ? readErr.message : 'Read failure';
        if (!treeItemsMap.has(filePath)) {
          pushDetails.push({ file: filePath, success: false, error: errorMsg });
        }
      }
    }

    const treeItems = Array.from(treeItemsMap.values());

    if (treeItems.length === 0) {
      return NextResponse.json({ error: 'No files valid for push' }, { status: 400 });
    }

    // Create a new git tree in a single request
    const treeBody: Record<string, unknown> = {
      tree: treeItems,
    };
    if (baseTreeSha) {
      treeBody.base_tree = baseTreeSha;
    }

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify(treeBody),
    });

    if (!treeRes.ok) {
      const errMsg = await treeRes.text();
      return NextResponse.json({ error: `Failed to create active git tree: ${errMsg}` }, { status: treeRes.status });
    }

    const treeData = await treeRes.json();
    const newTreeSha: string = treeData.sha;

    // Create commit
    const commitMsg = `[DARLEK CANN] Deploy State Backup: ${treeItems.length} core files`;
    const commitBody = {
      message: commitMsg,
      tree: newTreeSha,
      parents: refSha ? [refSha] : [],
    };

    const createCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify(commitBody),
    });

    if (!createCommitRes.ok) {
      const errMsg = await createCommitRes.text();
      return NextResponse.json({ error: `Failed to synthesize git commit: ${errMsg}` }, { status: createCommitRes.status });
    }

    const createdCommitData = await createCommitRes.json();
    const newCommitSha: string = createdCommitData.sha;

    // Update branch head reference
    let updateRefRes: Response;
    if (refSha) {
      updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          sha: newCommitSha,
          force: true,
        }),
      });
    } else {
      updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ref: `refs/heads/${branch}`,
          sha: newCommitSha,
        }),
      });
    }

    if (!updateRefRes.ok) {
      const errMsg = await updateRefRes.text();
      return NextResponse.json(
        { error: `Failed to update head reference of branch ${branch}: ${errMsg}` },
        { status: updateRefRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      pushed: treeItems.length,
      failed: pushDetails.filter((d) => !d.success).length,
      total: ENHANCEMENT_FILES.length,
      commitSha: newCommitSha,
      summary: `${treeItems.length}/${ENHANCEMENT_FILES.length} active system files securely backup-committed to ${owner}/${repo}@${branch} under single commit: ${newCommitSha.slice(
        0,
        7
      )}`,
      results: pushDetails.map((d) => ({ file: d.file, success: d.success, error: d.error })),
    });
  } catch (error: unknown) {
    console.error('Push enhancements error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}