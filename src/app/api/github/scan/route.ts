import { NextRequest, NextResponse } from 'next/server';
import type { ScanRepoBody, GitHubFile } from '@/lib/types';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'GITHUB_SCAN_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body: ScanRepoBody = await safeReqJson(req, {} as ScanRepoBody);
    const { token, owner, repo, branch } = body;

    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `GitHub API error: ${err}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (!data.tree) {
      return NextResponse.json({ error: 'No tree data returned. Check the branch name.' }, { status: 400 });
    }

    const files: GitHubFile[] = data.tree
      .filter((item: { type: string; path: string }) => item.type === 'blob')
      .filter((item: { path: string }) => {
        // Precise directory and file level exclusions to prevent false-positives
        // (such as falsely excluding .env.example or other custom files with matching substrings)
        const excludeDirs = ['node_modules/', '.git/', 'dist/', 'build/', '.next/', '__pycache__/', '.svn/'];
        const excludeFiles = ['.env', '.env.local', 'package-lock.json', 'yarn.lock', '.DS_Store'];

        const inExcludedDir = excludeDirs.some(dir => item.path.includes(dir));
        
        const pathParts = item.path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const isExcludedFile = excludeFiles.includes(fileName);

        return !inExcludedDir && !isExcludedFile;
      })
      .map((item: { path: string; size: number; type: string; sha: string }) => ({
        path: item.path,
        size: item.size,
        type: item.type,
        sha: item.sha,
      }));

    return NextResponse.json({
      files,
      total: files.length,
      repoTotal: data.tree.filter((item: { type: string }) => item.type === 'blob').length,
    });
  } catch (error) {
    console.error('Scan repo error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
