/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fetch_missing.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 * Optimization Engine: EMG Core v49 Neural Code and Documentation Optimizer Engine
 */

'use strict';

const fs = require('fs/promises');
const https = require('https');
const path = require('path');

/**
 * @typedef {Object} GitHubTreeItem
 * @property {string} path - Relative file path in the repository.
 * @property {string} mode - File mode bitfield representation.
 * @property {string} type - Node type ('blob' | 'tree').
 * @property {string} [sha] - SHA hash identifier.
 * @property {number} [size] - File size in bytes.
 * @property {string} [url] - Direct API endpoint URL.
 */

/**
 * @typedef {Object} GitHubTreeResponse
 * @property {string} sha - Tree commit SHA.
 * @property {string} url - GitHub Tree API endpoint.
 * @property {GitHubTreeItem[]} tree - List of repository objects.
 * @property {boolean} truncated - Indicates if output was truncated by server.
 */

const API_ENDPOINT = 'https://api.github.com/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1';
const LOCAL_DIR = 'src';
const OUTPUT_FILE = 'missing_files.json';

/**
 * Fetches repository structure from GitHub API asynchronously with resilience.
 * @param {string} url - Target endpoint URL.
 * @returns {Promise<GitHubTreeResponse>} Resolves with JSON response object.
 */
function fetchRemoteTree(url) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      headers: {
        'User-Agent': 'node.js/EMG-Core-v49',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.get(url, requestOptions, (res) => {
      const { statusCode } = res;
      if (statusCode !== 200) {
        res.resume(); // Consume stream to prevent memory leaks
        return reject(new Error(`HTTPS GET failed with status code: ${statusCode}`));
      }

      /** @type {Buffer[]} */
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          const rawString = Buffer.concat(chunks).toString('utf8');
          const data = JSON.parse(rawString);
          resolve(data);
        } catch (err) {
          reject(new Error(`Failed to parse remote response payload: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Network transmission failed: ${err.message}`));
    });

    req.end();
  });
}

/**
 * Asynchronously traverses local filesystem directory and returns normalized POSIX relative paths.
 * @param {string} dir - Directory to recursively traverse.
 * @returns {Promise<string[]>} Array of POSIX relative file paths.
 */
async function walkDirectory(dir) {
  const results = [];

  try {
    await fs.access(dir);
  } catch {
    // Return empty set safely if target directory does not exist locally
    return results;
  }

  /**
   * Recursive inner scanner utilizing non-blocking directory reading.
   * @param {string} currentDir 
   */
  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile()) {
          // Normalize platform-specific delimiters (Windows '\\' vs POSIX '/')
          const normalizedPath = fullPath.split(path.sep).join('/');
          results.push(normalizedPath);
        }
      })
    );
  }

  await scan(dir);
  return results;
}

/**
 * Core orchestration logic executing parallel tree processing and delta calculation.
 * @returns {Promise<void>}
 */
async function run() {
  try {
    const [remotePayload, localFiles] = await Promise.all([
      fetchRemoteTree(API_ENDPOINT),
      walkDirectory(LOCAL_DIR)
    ]);

    if (!remotePayload || !Array.isArray(remotePayload.tree)) {
      throw new Error('Received malformed payload structure from GitHub API.');
    }

    // Optimize membership verification from O(N*M) to O(1) time complexity
    const localFileSet = new Set(localFiles);
    const targetPrefix = `${LOCAL_DIR}/`;

    const missingFiles = remotePayload.tree.filter((item) => {
      return (
        item.type === 'blob' &&
        item.path.startsWith(targetPrefix) &&
        !localFileSet.has(item.path)
      );
    });

    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(missingFiles, null, 2),
      'utf8'
    );

    console.log(`Found ${missingFiles.length} missing files.`);
  } catch (err) {
    console.error(`[EMG Core Engine Error]: ${err.message}`);
    process.exitCode = 1;
  }
}

// Auto-execute process
run();