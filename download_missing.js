/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: download_missing.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const fs = require('fs');
const https = require('https');
const path = require('path');

const MISSING_FILES_PATH = 'missing_files.json';
const BASE_URL = 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/';

/**
 * Validates and reads the missing files manifest.
 * @returns {Array<{path: string}>}
 */
function loadMissingManifest() {
  try {
    if (!fs.existsSync(MISSING_FILES_PATH)) {
      throw new Error(`Manifest not found at ${MISSING_FILES_PATH}`);
    }
    const rawData = fs.readFileSync(MISSING_FILES_PATH, 'utf8');
    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      throw new Error('Manifest content must be an array of file objects.');
    }
    return parsed;
  } catch (error) {
    console.error(`[CRITICAL] Failed to load missing files manifest: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Downloads a single file via HTTPS with robust error handling and stream management.
 * @param {{path: string}} fileObj 
 * @returns {Promise<boolean>} Success status
 */
function download(fileObj) {
  return new Promise((resolve) => {
    const targetUrl = BASE_URL + fileObj.path;
    const requestOptions = {
      headers: { 'User-Agent': 'EMG-Neural-Code-Optimizer/4.9' }
    };

    const req = https.get(targetUrl, requestOptions, (res) => {
      if (res.statusCode !== 200) {
        console.error(`[ERROR] Failed to download ${fileObj.path}: HTTP status code ${res.statusCode}`);
        res.resume(); // Consume response data to free up memory
        return resolve(false);
      }

      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const dir = path.dirname(fileObj.path);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(fileObj.path, data, 'utf8');
          console.log(`Successfully downloaded: ${fileObj.path}`);
          resolve(true);
        } catch (writeError) {
          console.error(`[ERROR] Failed to write file ${fileObj.path}: ${writeError.message}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[ERROR] Network error downloading ${fileObj.path}: ${err.message}`);
      resolve(false);
    });

    req.end();
  });
}

/**
 * Orchestrates the sequential download of all qualifying missing files.
 * @returns {Promise<void>}
 */
async function doAll() {
  const missing = loadMissingManifest();
  let count = 0;

  for (const f of missing) {
    if (f && typeof f.path === 'string' && f.path.startsWith('src/')) {
      const success = await download(f);
      if (success) {
        count++;
      }
    }
  }

  console.log(`Download operation complete. Total files processed: ${count}.`);
}

// Execute execution cycle
doAll().catch((err) => {
  console.error(`[FATAL] Unhandled execution error in doAll: ${err.message}`);
  process.exit(1);
});