/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: download_missing.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

const MISSING_FILES_PATH = 'missing_files.json';
const BASE_URL = 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/';
const REQUEST_TIMEOUT_MS = 30000;
const USER_AGENT = 'EMG-Neural-Code-Optimizer/4.9';

/**
 * @typedef {Object} FileManifestEntry
 * @property {string} path - Relative path of the missing target file.
 */

/**
 * Validates and reads the missing files manifest securely with strict memory boundaries.
 * @returns {FileManifestEntry[]} Array of missing file objects.
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
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[CRITICAL] Failed to load missing files manifest: ${message}`);
    process.exit(1);
  }
}

/**
 * Downloads a single file via HTTPS with advanced stream management, memory buffering, and atomic cleanup.
 * @param {FileManifestEntry} fileObj - Object containing file path details.
 * @returns {Promise<boolean>} Success status of the download operation.
 */
function download(fileObj) {
  return new Promise((resolve) => {
    if (!fileObj || typeof fileObj.path !== 'string' || !fileObj.path.trim()) {
      console.error('[ERROR] Invalid file object provided for download.');
      return resolve(false);
    }

    const normalizedPath = path.normalize(fileObj.path);
    const targetUrl = BASE_URL + fileObj.path;
    const requestOptions = {
      headers: { 'User-Agent': USER_AGENT }
    };

    const dir = path.dirname(normalizedPath);
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (mkdirError) {
      const message = mkdirError instanceof Error ? mkdirError.message : String(mkdirError);
      console.error(`[ERROR] Failed to create directory ${dir}: ${message}`);
      return resolve(false);
    }

    const req = https.get(targetUrl, requestOptions, (res) => {
      if (res.statusCode !== 200) {
        console.error(`[ERROR] Failed to download ${fileObj.path}: HTTP status code ${res.statusCode}`);
        res.resume(); // Consume response stream to free memory
        return resolve(false);
      }

      const writeStream = fs.createWriteStream(normalizedPath);

      res.pipe(writeStream);

      writeStream.on('finish', () => {
        writeStream.close((err) => {
          if (err) {
            console.error(`[ERROR] Failed to close write stream for ${fileObj.path}: ${err.message}`);
            fs.unlink(normalizedPath, () => {});
            return resolve(false);
          }
          console.log(`Successfully downloaded: ${fileObj.path}`);
          resolve(true);
        });
      });

      writeStream.on('error', (writeError) => {
        console.error(`[ERROR] Failed to write file ${fileObj.path}: ${writeError.message}`);
        writeStream.destroy();
        fs.unlink(normalizedPath, () => {}); // Asynchronously clean up partial file
        resolve(false);
      });

      res.on('error', (resError) => {
        console.error(`[ERROR] Response stream error downloading ${fileObj.path}: ${resError.message}`);
        writeStream.destroy();
        fs.unlink(normalizedPath, () => {});
        resolve(false);
      });
    });

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      console.error(`[ERROR] Request timeout downloading ${fileObj.path}`);
      req.destroy();
      resolve(false);
    });

    req.on('error', (err) => {
      console.error(`[ERROR] Network error downloading ${fileObj.path}: ${err.message}`);
      resolve(false);
    });

    req.end();
  });
}

/**
 * Orchestrates the sequential download of all qualifying missing files with robust lifecycle tracking.
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

module.exports = {
  loadMissingManifest,
  download,
  doAll
};

// Execute execution cycle
if (require.main === module) {
  doAll().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[FATAL] Unhandled execution error in doAll: ${message}`);
    process.exit(1);
  });
}