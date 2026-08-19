import { NextRequest, NextResponse } from 'next/server';

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

import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'GITHUB_DELETE_FILE_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeReqJson(req, {});
    const { token, owner, repo, branch, path: filePath, sha, commitMessage } = body;

    if (!token || !owner || !repo || !branch || !filePath) {
      return NextResponse.json(
        { error: 'All fields are required: token, owner, repo, branch, path.' },
        { status: 400 }
      );
    }

    // Resolve accurate SHA from GitHub if missing or falsy
    let finalSha = sha || null;
    if (!finalSha) {
      const fetchedSha = await getFileSha(token, owner, repo, branch, filePath);
      if (fetchedSha) {
        finalSha = fetchedSha;
      }
    }

    if (!finalSha) {
      // If file doesn't exist, we don't need to delete it. Return success!
      return NextResponse.json({
        success: true,
        message: 'File did not exist, no deletion necessary.',
      });
    }

    const cleanPath = filePath.replace(/^\/+|\/+$/g, '');
    const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;

    const bodyPayload: Record<string, unknown> = {
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
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `GitHub API error during deletion: ${err}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      commitSha: data.commit?.sha,
      commitUrl: data.commit?.html_url,
    });
  } catch (error) {
    console.error('Delete file error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
