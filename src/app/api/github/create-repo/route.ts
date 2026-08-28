import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface CreateRepoRequestBody {
  token?: string;
  repoName?: string;
  description?: string;
}

interface GitHubUser {
  login: string;
}

interface GitHubRepo {
  default_branch?: string;
}

interface FileItem {
  path: string;
  content: string;
}

interface GitHubErrorResponse {
  message?: string;
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'online', service: 'GITHUB_CREATE_REPO_API' });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await safeReqJson(req, {})) as CreateRepoRequestBody;
    const { token, repoName, description } = body;

    if (!token || !repoName) {
      return NextResponse.json({ error: 'token and repoName are required' }, { status: 400 });
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) {
      return NextResponse.json({ error: 'GitHub authentication failed' }, { status: 401 });
    }
    const userData = (await userRes.json()) as GitHubUser;
    const owner = userData.login;

    const existingRepo = await fetch(`https://api.github.com/repos/${owner}/${encodeURIComponent(repoName)}`, { headers });
    let repoCreated = existingRepo.ok;
    let defaultBranch = 'main';

    if (!repoCreated) {
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: repoName,
          description: description || 'DARLEK CANN v3.0 — Code Evolution Engine',
          auto_init: true,
          private: false,
        }),
      });

      if (!createRes.ok) {
        const errData = (await createRes.json().catch(() => ({}))) as GitHubErrorResponse;
        return NextResponse.json({ error: `Failed to create repo: ${errData.message || createRes.statusText}` }, { status: createRes.status });
      }
      repoCreated = true;
    } else {
      const repoData = (await existingRepo.json()) as GitHubRepo;
      defaultBranch = repoData.default_branch || 'main';
    }

    const projectRoot = process.cwd();
    const extensionsToInclude = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.html', '.prisma']);
    const excludeDirs = new Set(['node_modules', '.next', '.git', 'download', 'work', 'upload', '.darleK-backups']);
    const excludeFiles = new Set(['db/custom.db']);
    const configFiles = new Set([
      'package.json', 'next.config.ts', 'next.config.js', 'next.config.mjs', 
      'tsconfig.json', 'tailwind.config.ts', 'tailwind.config.js', 
      'postcss.config.js', 'postcss.config.mjs', '.eslintrc.json', 
      '.eslintrc.js', 'eslint.config.mjs', 'README.md', '.gitignore', '.env.example'
    ]);

    const filesToPush: FileItem[] = [];

    async function collectFiles(dir: string, base: string = ''): Promise<void> {
      let entries;
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = base ? `${base}/${entry.name}` : entry.name;

        if (excludeDirs.has(entry.name)) continue;
        if (entry.name.startsWith('.') && !configFiles.has(relativePath)) continue;

        if (entry.isFile()) {
          const ext = `.${entry.name.split('.').pop()?.toLowerCase() || ''}`;
          const isConfig = configFiles.has(relativePath);
          if (extensionsToInclude.has(ext) || isConfig) {
            if (excludeFiles.has(relativePath)) continue;
            try {
              const content = await fs.readFile(fullPath, 'utf-8');
              filesToPush.push({ path: relativePath, content });
            } catch {
              // Skip unreadable files
            }
          }
        } else if (entry.isDirectory()) {
          await collectFiles(fullPath, relativePath);
        }
      }
    }

    await collectFiles(projectRoot);

    if (filesToPush.length === 0) {
      return NextResponse.json({ error: 'No files valid for push' }, { status: 400 });
    }

    let refSha: string | null = null;
    let attempts = 0;
    while (attempts < 5 && !refSha) {
      if (attempts > 0) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      try {
        const refUrl = `https://api.github.com/repos/${owner}/${encodeURIComponent(repoName)}/git/ref/heads/${defaultBranch}`;
        const refRes = await fetch(refUrl, { headers });
        if (refRes.ok) {
          const refData = await refRes.json();
          refSha = refData.object?.sha || null;
        }
      } catch (e) {
        console.error('Error fetching default branch ref attempts:', e);
      }
      attempts++;
    }

    let baseTreeSha: string | null = null;
    if (refSha) {
      const commitUrl = `https://api.github.com/repos/${owner}/${encodeURIComponent(repoName)}/git/commits/${refSha}`;
      const commitRes = await fetch(commitUrl, { headers });
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree?.sha || null;
      }
    }

    const treeItems = filesToPush.map(file => ({
      path: file.path,
      mode: '100644',
      type: 'blob',
      content: file.content,
    }));

    const treeBody: Record<string, unknown> = {
      tree: treeItems,
    };
    if (baseTreeSha) {
      treeBody.base_tree = baseTreeSha;
    }

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${encodeURIComponent(repoName)}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify(treeBody),
    });

    if (!treeRes.ok) {
      const errMsg = await treeRes.text();
      return NextResponse.json({ error: `Failed to create active git tree: ${errMsg}` }, { status: treeRes.status });
    }

    const treeData = await treeRes.json();
    const newTreeSha = treeData.sha;

    const commitMsg = `[DARLEK CANN] Deploy Initial Codebase: ${filesToPush.length} source files`;
    const commitBody: Record<string, unknown> = {
      message: commitMsg,
      tree: newTreeSha,
      parents: refSha ? [refSha] : [],
    };

    const createCommitRes = await fetch(`https://api.github.com/repos/${owner}/${encodeURIComponent(repoName)}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify(commitBody),
    });

    if (!createCommitRes.ok) {
      const errMsg = await createCommitRes.text();
      return NextResponse.json({ error: `Failed to synthesize git commit: ${errMsg}` }, { status: createCommitRes.status });
    }

    const createdCommitData = await createCommitRes.json();
    const newCommitSha = createdCommitData.sha;

    let updateRefRes;
    if (refSha) {
      updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${encodeURIComponent(repoName)}/git/refs/heads/${defaultBranch}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          sha: newCommitSha,
          force: true,
        }),
      });
    } else {
      updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${encodeURIComponent(repoName)}/git/refs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ref: `refs/heads/${defaultBranch}`,
          sha: newCommitSha,
        }),
      });
    }

    if (!updateRefRes.ok) {
      const errMsg = await updateRefRes.text();
      return NextResponse.json({ error: `Failed to update default branch head pointer to ${defaultBranch}: ${errMsg}` }, { status: updateRefRes.status });
    }

    return NextResponse.json({
      success: true,
      message: `Deploy complete to ${owner}/${repoName}. ${filesToPush.length} files pushed.`,
      repoUrl: `https://github.com/${owner}/${repoName}`,
      fullName: `${owner}/${repoName}`,
      url: `https://github.com/${owner}/${repoName}`,
      total: filesToPush.length,
      pushed: filesToPush.length,
      failed: 0,
      failures: [],
    });
  } catch (error) {
    console.error('Create repo error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}