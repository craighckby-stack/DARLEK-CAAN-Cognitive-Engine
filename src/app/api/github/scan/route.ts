import { NextRequest, NextResponse } from 'next/server';
import type { ScanRepoBody, GitHubFile } from '@/lib/types';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

interface GitHubTreeItem {
  path: string;
  mode?: string;
  type: string;
  sha: string;
  size?: number;
  url?: string;
}

interface GitHubTreeResponse {
  sha?: string;
  url?: string;
  tree?: GitHubTreeItem[];
  truncated?: boolean;
}

const EXCLUDED_DIRS = new Set([
  'node_modules/',
  '.git/',
  'dist/',
  'build/',
  '.next/',
  '__pycache__/',
  '.svn/',
]);

const EXCLUDED_FILES = new Set([
  '.env',
  '.env.local',
  'package-lock.json',
  'yarn.lock',
  '.DS_Store',
]);

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'online', service: 'GITHUB_SCAN_API' });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await safeReqJson<ScanRepoBody>(req, {} as ScanRepoBody);
    const { token, owner, repo, branch } = body;

    if (!owner || !repo || !branch) {
      return NextResponse.json(
        { error: 'Missing required parameters: owner, repo, and branch are mandatory.' },
        { status: 400 }
      );
    }

    const encodedBranch = encodeURIComponent(branch);
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodedBranch}?recursive=1`;

    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'DARLEK-CAAN-Security-Applet',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `GitHub API error: ${errText || res.statusText}` },
        { status: res.status }
      );
    }

    const data: GitHubTreeResponse = await res.json();

    if (!Array.isArray(data.tree)) {
      return NextResponse.json(
        { error: 'No tree data returned. Check the branch name or repository permissions.' },
        { status: 400 }
      );
    }

    const allBlobs = data.tree.filter((item): item is GitHubTreeItem => item.type === 'blob');
    const repoTotal = allBlobs.length;

    const files: GitHubFile[] = [];
    for (let i = 0; i < repoTotal; i++) {
      const item = allBlobs[i];
      const path = item.path;

      let inExcludedDir = false;
      for (const dir of EXCLUDED_DIRS) {
        if (path.includes(dir)) {
          inExcludedDir = true;
          break;
        }
      }

      if (inExcludedDir) {
        continue;
      }

      const lastSlashIdx = path.lastIndexOf('/');
      const fileName = lastSlashIdx === -1 ? path : path.substring(lastSlashIdx + 1);

      if (EXCLUDED_FILES.has(fileName)) {
        continue;
      }

      files.push({
        path: item.path,
        size: item.size ?? 0,
        type: item.type,
        sha: item.sha,
      });
    }

    return NextResponse.json({
      files,
      total: files.length,
      repoTotal,
    });
  } catch (error: unknown) {
    console.error('Scan repo error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}