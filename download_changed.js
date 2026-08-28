/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: download_changed.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const fs = require('node:fs');
const https = require('node:https');

/**
 * @typedef {Object} RemoteBlob
 * @property {string} path
 * @property {string} [sha]
 */

const REPOSITORY_BASE_URL = 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/';
const USER_AGENT = 'EMG-Core-v49-Neural-Code-Optimizer';

/**
 * Safely loads and parses the remote blobs inventory.
 * @returns {RemoteBlob[]}
 */
function loadRemoteBlobs() {
  try {
    const rawData = fs.readFileSync('remote_blobs.json', 'utf8');
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('CRITICAL: Failed to read or parse remote_blobs.json:', error.message);
    return [];
  }
}

/**
 * Fetches remote file content via HTTPS with strict error handling.
 * @param {string} url 
 * @returns {Promise<string>}
 */
function fetchRemoteContent(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP Status Code: ${res.statusCode}`));
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => resolve(data));
    });

    req.on('error', err => reject(err));
    req.end();
  });
}

/**
 * Asynchronously processes remote blobs, detects modifications, synchronizes files, and outputs results.
 */
async function processBlobsSequentially() {
  const remoteBlobs = loadRemoteBlobs();
  const changed = [];

  for (const fileObj of remoteBlobs) {
    if (!fileObj || typeof fileObj.path !== 'string') {
      continue;
    }

    if (!fileObj.path.startsWith('src/')) {
      continue;
    }

    try {
      if (fs.existsSync(fileObj.path)) {
        const localContent = fs.readFileSync(fileObj.path, 'utf8');
        const remoteUrl = REPOSITORY_BASE_URL + fileObj.path;
        
        const remoteContent = await fetchRemoteContent(remoteUrl);

        if (remoteContent !== localContent) {
          console.log(`Changed: ${fileObj.path}`);
          changed.push(fileObj);
          fs.writeFileSync(fileObj.path, remoteContent, 'utf8');
        }
      }
    } catch (error) {
      console.warn(`Warning: Failed to process path "${fileObj.path}":`, error.message);
    }
  }

  try {
    fs.writeFileSync('changed_files.json', JSON.stringify(changed, null, 2), 'utf8');
    console.log(`Found ${changed.length} changed files.`);
  } catch (error) {
    console.error('CRITICAL: Failed to write changed_files.json:', error.message);
  }
}

processBlobsSequentially();