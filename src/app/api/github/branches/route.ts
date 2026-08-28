import { NextRequest, NextResponse } from 'next/server';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

interface GitHubBranch {
  name: string;
  protected?: boolean;
  commit?: {
    sha: string;
    url: string;
  };
  [key: string]: unknown;
}

interface RequestBody {
  token?: unknown;
  owner?: unknown;
  repo?: unknown;
}

interface SanitizedBranch {
  name: string;
  default: boolean;
}

interface SuccessResponse {
  success: true;
  branches: SanitizedBranch[];
}

interface ErrorResponse {
  error: string;
}

export async function GET(): Promise<NextResponse<Record<string, string>>> {
  return NextResponse.json({ status: 'online', service: 'GITHUB_BRANCHES_API' });
}

export async function POST(req: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const body = (await safeReqJson(req, {})) as RequestBody;
    const { token, owner, repo } = body;

    if (
      typeof token !== 'string' ||
      typeof owner !== 'string' ||
      typeof repo !== 'string' ||
      !token.trim() ||
      !owner.trim() ||
      !repo.trim()
    ) {
      return NextResponse.json(
        { error: 'Valid string parameters for token, owner, and repo are required' },
        { status: 400 }
      );
    }

    const githubResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'EMG-Core-Neural-Code-Optimizer',
      },
      cache: 'no-store',
    });

    if (!githubResponse.ok) {
      let errMessage = `GitHub API returned status ${githubResponse.status}`;
      try {
        const errData = (await githubResponse.json()) as { message?: string };
        if (errData && typeof errData.message === 'string') {
          errMessage = errData.message;
        }
      } catch {
        // Fallback to default error message if JSON parsing fails
      }
      return NextResponse.json({ error: errMessage }, { status: githubResponse.status });
    }

    const rawBranches = (await githubResponse.json()) as GitHubBranch[];

    if (!Array.isArray(rawBranches)) {
      return NextResponse.json({ error: 'Invalid response format received from GitHub API' }, { status: 502 });
    }

    const branchList: SanitizedBranch[] = rawBranches.map((branch) => ({
      name: typeof branch.name === 'string' ? branch.name : '',
      default: Boolean(branch.default),
    }));

    return NextResponse.json({ success: true, branches: branchList });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
    console.error('[EMG Core v49] Branch list retrieval error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}