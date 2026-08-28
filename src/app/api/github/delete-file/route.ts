import { NextRequest, NextResponse } from 'next/server';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

interface DeleteFileRequestBody {
  token?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  path?: string;
  sha?: string;
  commitMessage?: string;
}

interface GitHubContentResponse {
  sha?: string;
}

interface GitHubDeleteResponse {
  commit?: {
    sha?: string;
    html_url?: string;
  };
}

/**
 * Sanitizes and safely encodes a file path for GitHub API consumption.
 */
function sanitizePath(filePath: string): string {
  const cleanPath = filePath.replace(/^\/+|\/+$/g, '');
  return cleanPath.split('/').map(encodeURIComponent).join('/');
}

/**
 * Fetches the actual file SHA from GitHub if not provided or to ensure accuracy.
 */
async function getFileSha(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  filePath: string
): Promise<string | null> {
  try {
    const encodedPath = sanitizePath(filePath);
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = (await res.json()) as GitHubContentResponse;
      return data.sha ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'online', service: 'GITHUB_DELETE_FILE_API' });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await safeReqJson(req, {})) as DeleteFileRequestBody;
    const { token, owner, repo, branch, path: filePath, sha, commitMessage } = body;

    if (!token || !owner || !repo || !branch || !filePath) {
      return NextResponse.json(
        { error: 'All fields are required: token, owner, repo, branch, path.' },
        { status: 400 }
      );
    }

    let finalSha = sha ?? null;
    if (!finalSha) {
      const fetchedSha = await getFileSha(token, owner, repo, branch, filePath);
      if (fetchedSha) {
        finalSha = fetchedSha;
      }
    }

    if (!finalSha) {
      return NextResponse.json({
        success: true,
        message: 'File did not exist, no deletion necessary.',
      });
    }

    const encodedPath = sanitizePath(filePath);
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;

    const bodyPayload = {
      message: commitMessage || `[DARLEK CANN] Delete ${filePath}`,
      sha: finalSha,
      branch,
    };

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `GitHub API error during deletion: ${err}` },
        { status: res.status }
      );
    }

    const data = (await res.json()) as GitHubDeleteResponse;

    return NextResponse.json({
      success: true,
      commitSha: data.commit?.sha,
      commitUrl: data.commit?.html_url,
    });
  } catch (error: unknown) {
    console.error('Delete file error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}