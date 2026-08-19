import { NextRequest, NextResponse } from 'next/server';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'GITHUB_BRANCHES_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeReqJson(req, {});
    const { token, owner, repo } = body;

    if (!token || !owner || !repo) {
      return NextResponse.json({ error: 'token, owner, and repo are required' }, { status: 400 });
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json({ error: errData.message || `GitHub API returned ${res.status}` }, { status: res.status });
    }

    const branches = await res.json();
    const branchList = branches.map((b: { name: string; default?: boolean }) => ({
      name: b.name,
      default: !!b.default,
    }));

    return NextResponse.json({ success: true, branches: branchList });
  } catch (error) {
    console.error('Branch list error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

