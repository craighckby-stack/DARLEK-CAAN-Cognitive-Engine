/**
 * @file restore_repo_fast.js
 * @version 49.1.0
 * @author EMG Core v49 Neural Code and Documentation Optimizer Engine
 * @description High-performance, memory-efficient, sovereign repository restoration engine with concurrency throttling and robust error handling.
 */

'use strict';

const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const OWNER = 'craighckby-stack';
const REPO = 'DARLEK_CAAN_ENGINE';
const BRANCH = 'main';
const MAX_CONCURRENT_REQUESTS = 16;
const TIMEOUT_MS = 30000;

/**
 * Performs an HTTPS GET request returning a promise resolving to the response body string with strict timeout protection.
 * @param {string} url - Target URL
 * @returns {Promise<string>} Response body
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'EMG-Core-Neural-Optimizer/49.1',
          'Accept': 'application/vnd.github.v3+json'
        }
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          res.resume();
          return reject(new Error(`HTTP status code ${res.statusCode} for ${url}`));
        }

        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      }
    );

    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy(new Error(`Request timeout exceeded (${TIMEOUT_MS}ms) for ${url}`));
    });

    req.on('error', (err) => reject(err));
  });
}

/**
 * Restores repository files matching target constraints with concurrency limiting.
 * @returns {Promise<void>}
 */
async function restoreRepository() {
  const treeUrl = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`;
  
  console.log(`[EMG-v49] Fetching repository tree from ${REPO}...`);
  
  let rawTreeData;
  try {
    rawTreeData = await fetchUrl(treeUrl);
  } catch (err) {
    console.error(`[EMG-v49] Critical Error: Failed to fetch repository tree: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  let parsedTree;
  try {
    parsedTree = JSON.parse(rawTreeData);
  } catch (err) {
    console.error(`[EMG-v49] Critical Error: Failed to parse repository tree JSON: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const tree = parsedTree.tree;
  if (!Array.isArray(tree)) {
    console.error('[EMG-v49] Critical Error: Invalid repository tree structure received.');
    process.exitCode = 1;
    return;
  }

  const srcFiles = tree.filter((f) => f && f.type === 'blob' && typeof f.path === 'string' && f.path.startsWith('src/'));
  console.log(`[EMG-v49] Restoring ${srcFiles.length} files from ${REPO}...`);

  let index = 0;
  let restoredCount = 0;
  let failedCount = 0;

  async function worker() {
    while (true) {
      const currentIndex = index++;
      if (currentIndex >= srcFiles.length) {
        return;
      }

      const file = srcFiles[currentIndex];
      const filePath = path.normalize(file.path);
      
      if (filePath.startsWith('..') || path.isAbsolute(filePath) || filePath.includes('\0')) {
        console.warn(`[EMG-v49] Skipped unsafe path: ${file.path}`);
        failedCount++;
        continue;
      }

      const fileUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${file.path}`;

      try {
        const content = await fetchUrl(fileUrl);
        const dir = path.dirname(filePath);
        
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, content, 'utf8');
        restoredCount++;
      } catch (err) {
        console.warn(`[EMG-v49] Warning: Failed to restore ${file.path}: ${err.message}`);
        failedCount++;
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(MAX_CONCURRENT_REQUESTS, srcFiles.length) },
    () => worker()
  );

  await Promise.all(workers);

  console.log(`[EMG-v49] ALL RESTORED! Successfully restored: ${restoredCount}, Failed: ${failedCount}`);
}

if (require.main === module) {
  restoreRepository().catch((err) => {
    console.error(`[EMG-v49] Fatal Engine Exception: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { restoreRepository };