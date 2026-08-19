import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export const maxDuration = 300;

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'GITHUB_BULK_COMMIT_API' });
}

interface CommittableFile {
  path: string;
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeReqJson(req, {});
    const { token, owner, repo, branch, files, commitMessage } = body;

    if (!token || !owner || !repo || !branch) {
      return NextResponse.json(
        { error: 'All connection fields are required: token, owner, repo, branch.' },
        { status: 400 }
      );
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided for bulk committing. Collect approved mutations first.' },
        { status: 400 }
      );
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // Verify repo exists, if not create it dynamically since the user might have deleted it
    const verifyRepoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers
    });

    if (verifyRepoRes.status === 404) {
const createRes = await fetch(`https://api.github.com/user/repos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: repo,
          private: false,
          auto_init: true
        })
      });
      if (!createRes.ok) {
        const createErr = await createRes.text();
        console.error('Failed to create missing repo in bulk commit:', createErr);
        return NextResponse.json({ error: `Failed to auto-create missing repository ${repo}: ${createErr}` }, { status: 400 });
      }
      
      // Wait for GitHub propagation so ref heads are available
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // ────────────────────────────────────────────────────────
    // STEP A: Get latest reference SHA (latest commit)
    // ────────────────────────────────────────────────────────
    const refUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`;
    let refRes = await fetch(refUrl, { headers });

    if (!refRes.ok) {
      // Branch not found (404), auto-create branch from default branch
      const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (repoInfoRes.ok) {
        const repoInfo = await repoInfoRes.json();
        const defaultBranch = repoInfo.default_branch || 'main';

        const defRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(defaultBranch)}`, { headers });
        if (defRefRes.ok) {
          const defRefData = await defRefRes.json();
          const defaultCommitSha = defRefData.object?.sha;
          if (defaultCommitSha) {
            const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                ref: `refs/heads/${branch}`,
                sha: defaultCommitSha,
              }),
            });
            if (createRefRes.ok) {
              refRes = await fetch(refUrl, { headers });
            }
          }
        }
      }
    }

    if (!refRes.ok) {
      const err = await refRes.text();
      return NextResponse.json(
        { error: `Could not fetch or create branch ref (${branch}): ${err}` },
        { status: refRes.status }
      );
    }

    const refData = await refRes.json();
    const latestCommitSha = refData.object?.sha;

    if (!latestCommitSha) {
      return NextResponse.json(
        { error: 'Could not resolve latest commit SHA from branch.' },
        { status: 500 }
      );
    }

    // ────────────────────────────────────────────────────────
    // STEP B: Get base commit's tree SHA
    // ────────────────────────────────────────────────────────
const commitUrl = `https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`;
    const commitRes = await fetch(commitUrl, { headers });

    if (!commitRes.ok) {
      const err = await commitRes.text();
      return NextResponse.json(
        { error: `Could not fetch commit details: ${err}` },
        { status: commitRes.status }
      );
    }

    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree?.sha;

    if (!baseTreeSha) {
      return NextResponse.json(
        { error: 'Could not resolve base tree SHA.' },
        { status: 500 }
      );
    }

    // ────────────────────────────────────────────────────────
    // STEP C: Create a new tree with modified files
    // ────────────�����───────────────────────────────────────────
// To prevent truncation and support large files, write blobs first and reference them by SHA
    // Write files to local disk workspace if path is within project root
    try {
      const projectRoot = resolve(process.cwd());
      for (const file of files) {
        if (!file.path || typeof file.content !== 'string') continue;
        const cleanPath = file.path.replace(/^\/+|\/+$/g, '');
        const localFilePath = resolve(projectRoot, cleanPath);
        if (localFilePath.startsWith(projectRoot)) {
          const parentDir = dirname(localFilePath);
          if (!existsSync(parentDir)) {
            mkdirSync(parentDir, { recursive: true });
          }
          writeFileSync(localFilePath, file.content, 'utf-8');
        }
      }
    } catch (diskErr) {
      console.warn('[Bulk Commit] Disk write warning:', diskErr);
    }

    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees`;
    const blobUrl = `https://api.github.com/repos/${owner}/${repo}/git/blobs`;

    const blobPromises = files.map(async (file: CommittableFile) => {
const blobRes = await fetch(blobUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: Buffer.from(file.content, 'utf-8').toString('base64'),
          encoding: 'base64',
        }),
      });

      if (!blobRes.ok) {
        const errMsg = await blobRes.text();
        throw new Error(`Failed to create git blob for file ${file.path}: ${errMsg}`);
      }

      const blobData = await blobRes.json();
      if (!blobData.sha) {
        throw new Error(`Git blob API did not return SHA for file ${file.path}`);
      }

      const cleanPath = file.path.replace(/^\/+|\/+$/g, '');
      return {
        path: cleanPath,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      };
    });

    let treeItems;
    try {
      treeItems = await Promise.all(blobPromises);
    } catch (blobErr: any) {
      return NextResponse.json(
        { error: blobErr?.message || 'Failed during file blob generation.' },
        { status: 500 }
      );
    }

    const treeRes = await fetch(treeUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems,
      }),
    });

    if (!treeRes.ok) {
      const err = await treeRes.text();
      return NextResponse.json(
        { error: `Could not create dynamic tree: ${err}` },
        { status: treeRes.status }
      );
    }

    const treeData = await treeRes.json();
    const newTreeSha = treeData.sha;

    if (!newTreeSha) {
      return NextResponse.json(
        { error: 'Could not create new tree SHA.' },
        { status: 500 }
      );
    }

    // ────────────────────────────────────────────────────────
    // STEP D: Create a commit pointing to the new tree and base commit
    // ────────────────────────────────────────────────────────
const createCommitUrl = `https://api.github.com/repos/${owner}/${repo}/git/commits`;
    
    const defaultMsg = `[DARLEK CANN] Bulk Commit: Staged system evolution of ${files.length} file${files.length > 1 ? 's' : ''}`;
    const commitBody = {
      message: commitMessage || defaultMsg,
      tree: newTreeSha,
      parents: [latestCommitSha],
    };

    const createCommitRes = await fetch(createCommitUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(commitBody),
    });

    if (!createCommitRes.ok) {
      const err = await createCommitRes.text();
      return NextResponse.json(
        { error: `Could not create commit resource: ${err}` },
        { status: createCommitRes.status }
      );
    }

    const createCommitData = await createCommitRes.json();
    const newCommitSha = createCommitData.sha;

    if (!newCommitSha) {
      return NextResponse.json(
        { error: 'Could not create commit.' },
        { status: 500 }
      );
    }

    // ────────────────────────────────────────────────────────
    // STEP E: Update branch reference to point to new commit
    // ────────────────────────────────────────────────────────
const updateRefUrl = `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`;
    
    const updateRefRes = await fetch(updateRefUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitSha,
        force: true,
      }),
    });

    if (!updateRefRes.ok) {
      const err = await updateRefRes.text();
      return NextResponse.json(
        { error: `Could not direct branch head reference: ${err}` },
        { status: updateRefRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      commitSha: newCommitSha,
      filesCommitted: files.length,
      commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommitSha}`,
    });
  } catch (error) {
    console.error('Bulk commit API crash:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown exception';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

