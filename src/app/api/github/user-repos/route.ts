import { NextRequest, NextResponse } from 'next/server';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'GITHUB_USER_REPOS_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeReqJson(req, {});
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'GitHub token is required' }, { status: 400 });
    }

    const [userRes, searchRes] = await Promise.all([
      fetch('https://api.github.com/user/repos?per_page=50&sort=updated', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }),
      fetch('https://api.github.com/search/repositories?q=user:microsoft+user:google+user:ibm+user:firebase+user:deepmind+user:vercel+user:facebook&sort=stars&order=desc&per_page=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })
    ]);

    if (!userRes.ok && userRes.status === 401) {
      return NextResponse.json({ error: 'GitHub token is invalid or expired. Please update your API key.' }, { status: 401 });
    }

    let repoList: any[] = [];

    if (userRes.ok) {
      const repos = await userRes.json();
      const mappedUserRepos = repos.map((r: any) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        owner: r.owner.login,
        defaultBranch: r.default_branch || 'main',
        url: r.html_url,
        description: r.description || '',
        language: r.language || '',
        isGlobalSiphon: false
      }));
      repoList = [...repoList, ...mappedUserRepos];
    } else {
      const text = await userRes.text();
      console.warn('Failed to load user repos:', userRes.status, text);
    }

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const searchRepos = (searchData.items || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        owner: r.owner.login,
        defaultBranch: r.default_branch || 'main',
        url: r.html_url,
        description: r.description || '',
        language: r.language || '',
        isGlobalSiphon: true
      }));
      repoList = [...repoList, ...searchRepos];
    } else {
      const text = await searchRes.text();
      console.warn('Failed to load global siphon repos:', searchRes.status, text);
    }

    // Deduplicate by ID just in case
    const uniqueRepos = Array.from(new Map(repoList.map(item => [item.id, item])).values());

    return NextResponse.json({ success: true, repos: uniqueRepos });
  } catch (error) {
    console.error('User repos list error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
