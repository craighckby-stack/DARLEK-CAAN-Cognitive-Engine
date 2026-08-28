import { NextRequest, NextResponse } from "next/server";
import { safeReqJson } from "@/lib/safe-json";

export const dynamic = "force-dynamic";

interface CreateBranchPayload {
  token?: string;
  owner?: string;
  repo?: string;
  baseBranch?: string;
  newBranch?: string;
}

interface GitHubRefResponse {
  object?: {
    sha?: string;
  };
}

interface GitHubErrorResponse {
  message?: string;
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: "online", service: "GITHUB_CREATE_BRANCH_API" });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await safeReqJson(req, {})) as CreateBranchPayload;
    const { token, owner, repo, baseBranch, newBranch } = body;

    if (!token || !owner || !repo || !baseBranch || !newBranch) {
      return NextResponse.json(
        { error: "token, owner, repo, baseBranch, and newBranch are required" },
        { status: 400 }
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "EMG-Core-v49-Neural-Code-Optimizer",
    };

    // Get the SHA of the base branch
    const refRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
      { headers }
    );

    if (!refRes.ok) {
      const errData = (await refRes.json().catch(() => ({}))) as GitHubErrorResponse;
      return NextResponse.json(
        { error: errData.message || `Failed to fetch base branch ref: ${refRes.status}` },
        { status: refRes.status }
      );
    }

    const refData = (await refRes.json()) as GitHubRefResponse;
    const sha = refData?.object?.sha;

    if (!sha) {
      return NextResponse.json(
        { error: "Failed to resolve SHA from base branch reference data." },
        { status: 502 }
      );
    }

    // Create the new branch
    const createRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: `refs/heads/${newBranch}`,
          sha,
        }),
      }
    );

    if (!createRes.ok) {
      const errData = (await createRes.json().catch(() => ({}))) as GitHubErrorResponse;
      return NextResponse.json(
        { error: errData.message || `Failed to create branch: ${createRes.status}` },
        { status: createRes.status }
      );
    }

    return NextResponse.json({ success: true, branch: newBranch });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Create branch error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}