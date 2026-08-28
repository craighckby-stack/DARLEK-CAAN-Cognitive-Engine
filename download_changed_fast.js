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

function fetchRemoteContent(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`Failed to fetch ${url}, status code: ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  let remoteBlobs;
  try {
    const rawMeta = fs.readFileSync(REMOTE_BLOBS_PATH, 'utf8');
    remoteBlobs = JSON.parse(rawMeta);
  } catch (err) {
    console.error(`Error reading or parsing ${REMOTE_BLOBS_PATH}:`, err.message);
    process.exit(1);
  }

  const changed = [];

  const candidateFiles = remoteBlobs.filter(
    (f) => typeof f.path === 'string' && f.path.startsWith('src/') && fs.existsSync(f.path)
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