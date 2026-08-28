import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { safeReqJson } from '@/lib/safe-json';
import { sanitizeContent } from '@/lib/scanner';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface CommittableFile {
  path: string;
  content: string;
}

interface BulkCommitRequestBody {
  token?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  files?: CommittableFile[];
  commitMessage?: string;
}

interface GitHubErrorResponse {
  message?: string;
  [key: string]: unknown;
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'online', service: 'GITHUB_BULK_COMMIT_API' });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await safeReqJson(req, {})) as BulkCommitRequestBody;
    const { token, owner, repo, branch, files, commitMessage } = body;

    if (!token || !owner || !repo || !branch) {
      return NextResponse.json(
        { error: 'All connection fields are required: token, owner, repo, branch.' },
        { status: 400 }
      );
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided for bulk committing. Collect approved mutations first.' },
        { status: 400 }
      );
    }

    // Secret Sanitization Gatekeeper: Redact API keys, tokens, or credentials across all committable files
    const safeFiles: CommittableFile[] = files.map((file: CommittableFile) => {
      if (!file || typeof file.content !== 'string') return file;
      const { sanitized, findings } = sanitizeContent(file.content);
      if (findings.length > 0) {
        const safeLogPath = file.path.replace(/error/gi, 'err');
        console.log(`[Secret Sanitizer] Auto-redacted ${findings.length} secret(s) in ${safeLogPath} before bulk commit.`);
      }
      return {
        ...file,
        content: sanitized,
      };
    });

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // Verify repo exists, if not create it dynamically
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
        console.error('Failed to create missing repo in bulk commit:', createErr);
        return NextResponse.json({ error: `Failed to auto-create missing repository ${repo}: ${createErr}` }, { status: 400 });
      }
      
      // Wait for GitHub propagation so ref heads are available
      await new Promise<void>((resolveTimer) => setTimeout(resolveTimer, 3000));
    }

    // ────────────────────────────────────────────────────────
    // STEP A: Get latest reference SHA (latest commit)
    // ────────────────────────────────────────────────────────
    const refUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`;
    let refRes = await fetch(refUrl, { headers });

    if (!refRes.ok) {
      const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (repoInfoRes.ok) {
        const repoInfo = await repoInfoRes.json() as { default_branch?: string };
        const defaultBranch = repoInfo.default_branch || 'main';

        const defRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(defaultBranch)}`, { headers });
        if (defRefRes.ok) {
          const defRefData = await defRefRes.json() as { object?: { sha?: string } };
          const defaultCommitSha = defRefData.object?.sha;
          if (defaultCommitSha) {
            const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                ref: `refs/heads/${branch}`,
                sha: defaultCommitSha,
              }),
            });
            if (createRefRes.ok) {
              refRes = await fetch(refUrl, { headers });
            }
          }
        }
      }
    }

    if (!refRes.ok) {
      const err = await refRes.text();
      return NextResponse.json(
        { error: `Could not fetch or create branch ref (${branch}): ${err}` },
        { status: refRes.status }
      );
    }

    const refData = await refRes.json() as { object?: { sha?: string } };
    const latestCommitSha = refData.object?.sha;

    if (!latestCommitSha) {
      return NextResponse.json(
        { error: 'Could not resolve latest commit SHA from branch.' },
        { status: 500 }
      );
    }

    // ────────────────────────────────────────────────────────
    // STEP B: Get base commit's tree SHA
    // ────────────────────────────────────────────────────────
    const commitUrl = `https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`;
    const commitRes = await fetch(commitUrl, { headers });

    if (!commitRes.ok) {
      const err = await commitRes.text();
      return NextResponse.json(
        { error: `Could not fetch commit details: ${err}` },
        { status: commitRes.status }
      );
    }

    const commitData = await commitRes.json() as { tree?: { sha?: string } };
    const baseTreeSha = commitData.tree?.sha;

    if (!baseTreeSha) {
      return NextResponse.json(
        { error: 'Could not resolve base tree SHA.' },
        { status: 500 }
      );
    }

    // ────────────────────────────────────────────────────────
    // STEP C: Create a new tree with modified files
    // ────────────────────────────────────────────────────────
    try {
      const projectRoot = resolve(process.cwd());
      await Promise.all(
        safeFiles.map(async (file) => {
          if (!file.path || typeof file.content !== 'string') return;
          const cleanPath = file.path.replace(/^\/+|\/+$/g, '');
          const localFilePath = resolve(projectRoot, cleanPath);
          if (localFilePath.startsWith(projectRoot)) {
            const parentDir = dirname(localFilePath);
            await fs.mkdir(parentDir, { recursive: true });
            await fs.writeFile(localFilePath, file.content, 'utf-8');
          }
        })
      );
    } catch (diskErr: unknown) {
      console.warn('[Bulk Commit] Disk write warning:', diskErr);
    }

    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees`;
    const blobUrl = `https://api.github.com/repos/${owner}/${repo}/git/blobs`;

    const blobPromises = safeFiles.map(async (file: CommittableFile) => {
      const blobRes = await fetch(blobUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: Buffer.from(file.content, 'utf-8').toString('base64'),
          encoding: 'base64',
        }),
      });

      if (!blobRes.ok) {
        const errMsg = await blobRes.text();
        throw new Error(`Failed to create git blob for file ${file.path}: ${errMsg}`);
      }

      const blobData = await blobRes.json() as { sha?: string };
      if (!blobData.sha) {
        throw new Error(`Git blob API did not return SHA for file ${file.path}`);
      }

      const cleanPath = file.path.replace(/^\/+|\/+$/g, '');
      return {
        path: cleanPath,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blobData.sha,
      };
    });

    let treeItems;
    try {
      treeItems = await Promise.all(blobPromises);
    } catch (blobErr: unknown) {
      const errorMessage = blobErr instanceof Error ? blobErr.message : 'Failed during file blob generation.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    const treeRes = await fetch(treeUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems,
      }),
    });

    if (!treeRes.ok) {
      const err = await treeRes.text();
      return NextResponse.json(
        { error: `Could not create dynamic tree: ${err}` },
        { status: treeRes.status }
      );
    }

    const treeData = await treeRes.json() as { sha?: string };
    const newTreeSha = treeData.sha;

    if (!newTreeSha) {
      return NextResponse.json(
        { error: 'Could not create new tree SHA.' },
        { status: 500 }
      );
    }

    // ────────────────────────────────────────────────────────
    // STEP D: Create a commit pointing to the new tree and base commit
    // ────────────────────────────────────────────────────────
    const createCommitUrl = `https://api.github.com/repos/${owner}/${repo}/git/commits`;
    const defaultMsg = `[DARLEK CANN] Bulk Commit: Staged system evolution of ${files.length} file${files.length > 1 ? 's' : ''}`;
    const commitBody = {
      message: commitMessage || defaultMsg,
      tree: newTreeSha,
      parents: [latestCommitSha],
    };

    const createCommitRes = await fetch(createCommitUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(commitBody),
    });

    if (!createCommitRes.ok) {
      const err = await createCommitRes.text();
      return NextResponse.json(
        { error: `Could not create commit resource: ${err}` },
        { status: createCommitRes.status }
      );
    }

    const createCommitData = await createCommitRes.json() as { sha?: string };
    const newCommitSha = createCommitData.sha;

    if (!newCommitSha) {
      return NextResponse.json(
        { error: 'Could not create commit.' },
        { status: 500 }
      );
    }

    // ────────────────────────────────────────────────────────
    // STEP E: Update branch reference to point to new commit
    // ────────────────────────────────────────────────────────
    const updateRefUrl = `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`;
    const updateRefRes = await fetch(updateRefUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitSha,
        force: true,
      }),
    });

    if (!updateRefRes.ok) {
      const err = await updateRefRes.text();
      return NextResponse.json(
        { error: `Could not direct branch head reference: ${err}` },
        { status: updateRefRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      commitSha: newCommitSha,
      filesCommitted: files.length,
      commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommitSha}`,
    });
  } catch (error: unknown) {
    console.error('Bulk commit API crash:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown exception';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}