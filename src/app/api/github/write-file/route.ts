import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import type { WriteFileBody } from '@/lib/types';

// Helper to ensure target repository exists on GitHub
async function ensureRepoExists(token: string, owner: string, repo: string): Promise<boolean> {
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (res.ok) return true;
    if (res.status === 404) {
      const createRes = await fetch(`https://api.github.com/user/repos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: repo, private: false, auto_init: true }),
      });
      if (createRes.ok) {
        await new Promise((r) => setTimeout(r, 2000));
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

// Helper to fetch the actual file SHA from GitHub if not provided or to ensure it is accurate
async function getFileSha(token: string, owner: string, repo: string, branch: string, filePath: string): Promise<string | null> {
  try {
    const cleanPath = filePath.replace(/^\/+|\/+$/g, '');
    const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.sha || null;
    }
    return null;
  } catch {
    return null;
  }
}

// Helper to ensure target branch exists on GitHub, creating it from default branch if needed
async function ensureBranchExists(token: string, owner: string, repo: string, branch: string): Promise<boolean> {
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    const refUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`;
    const refRes = await fetch(refUrl, { headers });
    if (refRes.ok) return true;

    // Branch not found, fetch repo info for default_branch
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) return false;

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    const defRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(defaultBranch)}`, { headers });
    if (!defRefRes.ok) return false;

    const defRefData = await defRefRes.json();
    const defaultSha = defRefData.object?.sha;
    if (!defaultSha) return false;

    // Create branch
    const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: defaultSha,
      }),
    });

    return createRes.ok;
  } catch {
    return false;
  }
}

import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'GITHUB_WRITE_FILE_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body: WriteFileBody = await safeReqJson(req, {} as WriteFileBody);
    const { token, owner, repo, branch, path: filePath, content, sha, commitMessage } = body;

    if (!token || !owner || !repo || !branch || !filePath || content === undefined || content === null) {
      return NextResponse.json(
        { error: 'All fields are required: token, owner, repo, branch, path, content.' },
        { status: 400 }
      );
    }

    const cleanPath = filePath.replace(/^\/+|\/+$/g, '');

    // 1. Write file to local disk workspace if path is within project root
    try {
      const projectRoot = resolve(process.cwd());
      const localFilePath = resolve(projectRoot, cleanPath);
      if (localFilePath.startsWith(projectRoot)) {
        const parentDir = dirname(localFilePath);
        if (!existsSync(parentDir)) {
          mkdirSync(parentDir, { recursive: true });
        }
        writeFileSync(localFilePath, content, 'utf-8');
        console.log(`[Write File] Local disk file updated: ${cleanPath}`);
      }
    } catch (diskErr) {
      console.warn(`[Write File] Local disk write warning for ${cleanPath}:`, diskErr);
    }

    // 2. Ensure repository and branch exist on GitHub
    await ensureRepoExists(token, owner, repo);
    await ensureBranchExists(token, owner, repo, branch);

    // Resolve accurate live SHA from GitHub to eliminate stale SHA mismatches
    let finalSha = await getFileSha(token, owner, repo, branch, cleanPath) || sha || null;

    const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;

    const bodyPayload: Record<string, unknown> = {
      message: commitMessage || `[DARLEK CANN] Mutate ${cleanPath}`,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      branch,
    };

    if (finalSha) {
      bodyPayload.sha = finalSha;
    }

    let res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    // Self-healing retry: If status is 409, 422, or 400 (SHA conflict/missing branch), re-check branch/SHA and retry once
    if (!res.ok && (res.status === 409 || res.status === 422 || res.status === 400 || res.status === 404)) {
      console.warn(`[Write File] Issue (${res.status}) on ${cleanPath}. Re-verifying branch & live SHA...`);
      await ensureBranchExists(token, owner, repo, branch);
      const liveSha = await getFileSha(token, owner, repo, branch, cleanPath);
      if (liveSha) {
        bodyPayload.sha = liveSha;
      } else {
        delete bodyPayload.sha;
      }
      res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      let parsedErr = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedErr = jsonErr.message || jsonErr.error || errText;
      } catch {}
      return NextResponse.json(
        { error: `GitHub API error: ${parsedErr}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      commitSha: data.commit?.sha || '',
      contentSha: data.content?.sha || '',
      commitUrl: data.commit?.html_url || '',
    });
  } catch (error) {
    console.error('Write file error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

