/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: compare.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const fs = require('fs');
const https = require('https');
const path = require('path');

/**
 * Recursively walks a directory to collect all file paths synchronously.
 * Uses `readdirSync` with `{ withFileTypes: true }` to avoid redundant stat calls
 * and optimizes array allocations.
 *
 * @param {string} dir - The root directory path to walk.
 * @returns {string[]} Array of normalized file paths using forward slashes.
 */
function walk(dir) {
  /** @type {string[]} */
  const results = [];

  if (typeof dir !== 'string' || !dir) {
    return results;
  }

  /**
   * Helper function to perform depth-first directory traversal.
   * @param {string} currentDir - Current directory path.
   */
  function traverse(currentDir) {
    try {
      if (!fs.existsSync(currentDir)) {
        return;
      }
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const filePath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          traverse(filePath);
        } else {
          results.push(filePath.replace(/\\/g, '/'));
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[EMG Error] Failed to read directory ${currentDir}:`, message);
    }
  }

  traverse(dir);
  return results;
}

/** @type {https.RequestOptions} */
const options = {
  hostname: 'api.github.com',
  path: '/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1',
  headers: { 
    'User-Agent': 'EMG-Core-v49-Neural-Code-Optimizer',
    'Accept': 'application/vnd.github.v3+json'
  }
};

/**
 * Executes the HTTPS GET request to fetch remote tree structure.
 */
const req = https.get(options, (res) => {
  if (res.statusCode !== 200) {
    console.error(`[EMG Error] GitHub API returned status code: ${res.statusCode}`);
    res.resume();
    return;
  }

  /** @type {Buffer[]} */
  const chunks = [];

  res.on('data', (chunk) => {
    chunks.push(chunk);
  });

  res.on('end', () => {
    try {
      const rawData = Buffer.concat(chunks).toString('utf8');
      const parsed = JSON.parse(rawData);

      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.tree)) {
        console.error('[EMG Error] Invalid JSON structure received from GitHub API.');
        return;
      }

      /** @type {string[]} */
      const remoteFiles = parsed.tree
        .filter((f) => f && f.type === 'blob' && typeof f.path === 'string')
        .map((f) => f.path);

      const localFiles = walk('src');

      const remoteSet = new Set(remoteFiles);
      const localSet = new Set(localFiles);

      console.log('Files in remote but not local:');
      for (let i = 0; i < remoteFiles.length; i++) {
        const f = remoteFiles[i];
        if (!localSet.has(f) && f.startsWith('src/')) {
          console.log('  ' + f);
        }
      }

      console.log('\nFiles in local but not remote:');
      for (let i = 0; i < localFiles.length; i++) {
        const f = localFiles[i];
        if (!remoteSet.has(f)) {
          console.log('  ' + f);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[EMG Error] Failed to parse API response payload:', message);
    }
  });
});

req.on('error', (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('[EMG Error] Network transmission failure:', message);
});