/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: download_changed_fast.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 * Optimized by EMG Core v49 Neural Code and Documentation Optimizer Engine.
 */

'use strict';

const fs = require('fs');
const https = require('https');

const REMOTE_BLOBS_PATH = 'remote_blobs.json';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/';
const USER_AGENT = 'EMG-Neural-Code-Optimizer-v49';

/**
 * Fetches remote content from a given URL using a secure HTTPS request.
 * @param {string} url - The target URL to fetch.
 * @returns {Promise<string>} The response body as a string.
 */
function fetchRemoteContent(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`Failed to fetch ${url}, status code: ${res.statusCode}`));
      }
      
      // Use array chunks to optimize memory efficiency for large payloads
      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      res.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf8'));
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main execution routine for identifying and updating changed files.
 * @returns {Promise<void>}
 */
async function main() {
  let remoteBlobs;
  try {
    const rawMeta = fs.readFileSync(REMOTE_BLOBS_PATH, 'utf8');
    remoteBlobs = JSON.parse(rawMeta);
  } catch (err) {
    console.error(`Error reading or parsing ${REMOTE_BLOBS_PATH}:`, err.message);
    process.exit(1);
  }

  if (!Array.isArray(remoteBlobs)) {
    console.error(`Invalid structure in ${REMOTE_BLOBS_PATH}: Expected an array.`);
    process.exit(1);
  }

  const changed = [];

  const candidateFiles = remoteBlobs.filter(
    (f) => f && typeof f.path === 'string' && f.path.startsWith('src/') && fs.existsSync(f.path)
  );

  const promises = candidateFiles.map(async (fileObj) => {
    try {
      const localContent = fs.readFileSync(fileObj.path, 'utf8');
      const remoteUrl = GITHUB_RAW_BASE + fileObj.path;
      const remoteContent = await fetchRemoteContent(remoteUrl);

      if (remoteContent !== localContent) {
        console.log(`Changed: ${fileObj.path}`);
        changed.push(fileObj);
        fs.writeFileSync(fileObj.path, remoteContent, 'utf8');
      }
    } catch (err) {
      // Gracefully handle network or file system anomalies per original contract
    }
  });

  await Promise.all(promises);
  console.log(`Found and updated ${changed.length} changed files.`);
}

main();