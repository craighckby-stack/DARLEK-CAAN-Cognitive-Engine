import { NextRequest, NextResponse } from "next/server";
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'GITHUB_CREATE_BRANCH_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeReqJson(req, {});
    const { token, owner, repo, baseBranch, newBranch } = body;

    if (!token || !owner || !repo || !baseBranch || !newBranch) {
      return NextResponse.json(
        { error: "token, owner, repo, baseBranch, and newBranch are required" },
        { status: 400 }
      );
    }

    // Get the SHA of the base branch
    const refRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!refRes.ok) {
      const errData = await refRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || `Failed to fetch base branch ref: ${refRes.status}` },
        { status: refRes.status }
      );
    }

    const refData = await refRes.json();
    const sha = refData.object.sha;

    // Create the new branch
    const createRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: `refs/heads/${newBranch}`,
          sha: sha,
        }),
      }
    );

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || `Failed to create branch: ${createRes.status}` },
        { status: createRes.status }
      );
    }

    return NextResponse.json({ success: true, branch: newBranch });
  } catch (error) {
    console.error("Create branch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

