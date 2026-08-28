import { NextRequest, NextResponse } from 'next/server';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  default_branch?: string;
  html_url: string;
  description?: string | null;
  language?: string | null;
}

interface GitHubSearchResponse {
  items?: GitHubRepository[];
}

export interface MappedRepository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  url: string;
  description: string;
  language: string;
  isGlobalSiphon: boolean;
}

interface RequestBody {
  token?: string;
}

const GITHUB_API_BASE = 'https://api.github.com';
const USER_AGENT = 'DARLEK-CAAN-Security-Applet';

function getGitHubHeaders(token: string): HeadersInit {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': USER_AGENT,
  };
}

function mapRepository(repo: GitHubRepository, isGlobalSiphon: boolean): MappedRepository {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner?.login ?? 'unknown',
    defaultBranch: repo.default_branch || 'main',
    url: repo.html_url,
    description: repo.description ?? '',
    language: repo.language ?? '',
    isGlobalSiphon,
  };
}

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'GITHUB_USER_REPOS_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await safeReqJson(req, {})) as RequestBody;
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'GitHub token is required' }, { status: 400 });
    }

    const headers = getGitHubHeaders(token);
    const searchQueries = 'user:microsoft+user:google+user:ibm+user:firebase+user:deepmind+user:vercel+user:facebook';
    const searchUrl = `${GITHUB_API_BASE}/search/repositories?q=${searchQueries}&sort=stars&order=desc&per_page=50`;

    const [userRes, searchRes] = await Promise.all([
      fetch(`${GITHUB_API_BASE}/user/repos?per_page=50&sort=updated`, { headers }),
      fetch(searchUrl, { headers })
    ]);

    if (!userRes.ok && userRes.status === 401) {
      return NextResponse.json(
        { error: 'GitHub token is invalid or expired. Please update your API key.' },
        { status: 401 }
      );
    }

    const repoList: MappedRepository[] = [];

    if (userRes.ok) {
      const repos = (await userRes.json()) as GitHubRepository[];
      if (Array.isArray(repos)) {
        for (const repo of repos) {
          repoList.push(mapRepository(repo, false));
        }
      }
    } else {
      const text = await userRes.text();
      console.warn(`Failed to load user repos: [${userRes.status}] ${text}`);
    }

    if (searchRes.ok) {
      const searchData = (await searchRes.json()) as GitHubSearchResponse;
      const items = searchData.items;
      if (Array.isArray(items)) {
        for (const repo of items) {
          repoList.push(mapRepository(repo, true));
        }
      }
    } else {
      const text = await searchRes.text();
      console.warn(`Failed to load global siphon repos: [${searchRes.status}] ${text}`);
    }

    // Deduplicate efficiently using a Map
    const uniqueMap = new Map<number, MappedRepository>();
    for (const repo of repoList) {
      uniqueMap.set(repo.id, repo);
    }
    const uniqueRepos = Array.from(uniqueMap.values());

    return NextResponse.json({ success: true, repos: uniqueRepos });
  } catch (error) {
    console.error('User repos list error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown internal error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}