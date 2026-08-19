import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import { db } from '@/lib/db';

export const maxDuration = 120;

// ── SYSTEM REBOOT ──────────────────────────────────────────────────
// Pulls enhanced files from GitHub back to the local filesystem.
// Creates timestamped backups before overwriting any local file.
// Only touches files that were actually mutated by DARLEK CANN.
// ───────────────────────────────────────────────────────────────────

interface RebootFileResult {
  file: string;
  status: 'updated' | 'skipped' | 'error';
  backup?: string;
  error?: string;
}

import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'SYSTEM_REBOOT_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeReqJson(req, {});
    const { token, owner, repo, branch, sessionId } = body;

    if (!token || !owner || !repo || !branch) {
      return NextResponse.json(
        { error: 'token, owner, repo, and branch are required' },
        { status: 400 }
      );
    }

    // Step 1: Find all applied mutations from BRAIN session
    let mutatedFiles: string[] = [];

    if (sessionId) {
      try {
        const mutations = await db.mutationHistory.findMany({
          where: {
            sessionId,
            status: 'applied',
          },
          orderBy: { createdAt: 'desc' },
          select: { filePath: true },
        });
        mutatedFiles = mutations.map(m => m.filePath);
      } catch {
        // BRAIN DB may not be available — fall back to scanning the repo
      }
    }

    // If no session mutations found, fetch ALL source files from the repo
    if (mutatedFiles.length === 0) {
      const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
      const treeRes = await fetch(treeUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (treeRes.ok) {
        const treeData = await treeRes.json();
        const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.html'];
        const sourceFiles = (treeData.tree || [])
          .filter((item: { type: string; path: string }) => {
            if (item.type !== 'blob') return false;
            if (item.path.includes('node_modules/') || item.path.includes('.next/') || item.path.includes('.git/')) return false;
            const ext = '.' + item.path.split('.').pop()?.toLowerCase();
            return sourceExtensions.includes(ext) || ['next.config', 'package.json', 'tsconfig.json', 'tailwind.config', 'postcss.config', '.eslintrc'].some(k => item.path === k || item.path.startsWith(k + '.'));
          })
          .map((item: { path: string }) => item.path);
        mutatedFiles = sourceFiles;
      }
    }

    if (mutatedFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No files to reboot — no mutations found in this session.',
        results: [],
        total: 0,
        updated: 0,
      });
    }

    // Step 2: Create backup directory
    const projectRoot = process.cwd();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupDir = path.join(projectRoot, '.darleK-backups', `pre-reboot-${timestamp}`);
    await fs.mkdir(backupDir, { recursive: true });

    // Step 3: For each mutated file, download from GitHub and write locally
    const results: RebootFileResult[] = [];
    let updated = 0;
    let failed = 0;
    const rateDelay = 300;

    for (let i = 0; i < mutatedFiles.length; i++) {
      const filePath = mutatedFiles[i];

      if (!filePath.startsWith('src/') && !filePath.startsWith('public/') &&
          !['package.json', 'next.config.ts', 'next.config.js', 'next.config.mjs', 'tsconfig.json', 'tailwind.config.ts', 'tailwind.config.js', 'postcss.config.js', 'postcss.config.mjs', '.eslintrc.json', '.eslintrc.js'].includes(filePath)) {
        results.push({ file: filePath, status: 'skipped' });
        continue;
      }

      try {
        if (i > 0) await new Promise(r => setTimeout(r, rateDelay));

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`;
        const fileRes = await fetch(fileUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!fileRes.ok) {
          results.push({ file: filePath, status: 'error', error: `GitHub API returned ${fileRes.status}` });
          failed++;
          continue;
        }

        const fileData = await fileRes.json();
        if (fileData.encoding !== 'base64' || !fileData.content) {
          results.push({ file: filePath, status: 'skipped', error: 'Binary or empty file' });
          continue;
        }

        const newContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const localPath = path.join(projectRoot, filePath);

        if (existsSync(localPath)) {
          const backupPath = path.join(backupDir, filePath);
          const backupSubDir = path.dirname(backupPath);
          await fs.mkdir(backupSubDir, { recursive: true });
          await fs.copyFile(localPath, backupPath);

          const existingContent = await fs.readFile(localPath, 'utf-8');
          if (existingContent === newContent) {
            results.push({ file: filePath, status: 'skipped', backup: backupPath });
            continue;
          }
        }

        const fileDir = path.dirname(localPath);
        await fs.mkdir(fileDir, { recursive: true });
        await fs.writeFile(localPath, newContent, 'utf-8');
        updated++;

        results.push({ file: filePath, status: 'updated' });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        results.push({ file: filePath, status: 'error', error: errMsg });
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reboot complete. ${updated} files updated, ${results.filter(r => r.status === 'skipped').length} skipped, ${failed} failed.`,
      results,
      total: mutatedFiles.length,
      updated,
      failed,
      backupDir: `.darleK-backups/pre-reboot-${timestamp}`,
    });
  } catch (error) {
    console.error('Reboot error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
