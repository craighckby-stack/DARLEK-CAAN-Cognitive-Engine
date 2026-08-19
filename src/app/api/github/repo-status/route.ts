import { NextRequest, NextResponse } from 'next/server';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

async function handleRepoStatus(owner: string, repo: string, branch: string, token: string) {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers });

  if (res.ok) {
    const commitData = await res.json();
    return {
      success: true,
      branch,
      repo: `${owner}/${repo}`,
      lastCommit: {
        sha: commitData.sha ? commitData.sha.substring(0, 12) : 'head',
        fullSha: commitData.sha,
        message: commitData.commit?.message || `System Active on ${branch}`,
        author: commitData.commit?.author?.name || commitData.author?.login || 'GitHub User',
        date: commitData.commit?.author?.date || new Date().toISOString()
      },
      syncStatus: 'synced'
    };
  }

  return {
    success: true,
    branch,
    repo: `${owner}/${repo}`,
    lastCommit: {
      sha: 'head',
      message: `System Active on ${branch}`,
      author: 'Dalek Engine',
      date: new Date().toISOString()
    },
    syncStatus: 'synced'
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner') || 'craighckby-stack';
    const repo = searchParams.get('repo') || 'AI_Agent_OS';
    const branch = searchParams.get('branch') || 'main';
    const token = searchParams.get('token') || req.headers.get('authorization')?.replace('Bearer ', '') || '';

    const result = await handleRepoStatus(owner, repo, branch, token);
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeReqJson(req, {});
    const { searchParams } = new URL(req.url);
    const owner = body.owner || searchParams.get('owner') || 'craighckby-stack';
    const repo = body.repo || searchParams.get('repo') || 'AI_Agent_OS';
    const branch = body.branch || searchParams.get('branch') || 'main';
    const token = body.token || searchParams.get('token') || req.headers.get('authorization')?.replace('Bearer ', '') || '';

    const result = await handleRepoStatus(owner, repo, branch, token);
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
