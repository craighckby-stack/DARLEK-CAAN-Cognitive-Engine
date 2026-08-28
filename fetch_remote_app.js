/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fetch_remote_app.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

// @ts-check
'use strict';

const { createWriteStream } = require('node:fs');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');

/**
 * @typedef {Object} DownloadTarget
 * @property {string} url - The target HTTPS URL to fetch.
 * @property {string} dest - The local destination file path.
 */

/**
 * Fetches a remote resource securely and streams it directly to the specified destination path.
 * 
 * @param {string} url - The target HTTPS URL to fetch.
 * @param {string} destPath - The local file path to write the downloaded content.
 * @returns {Promise<void>} Resolves when stream writing is complete.
 * @throws {TypeError} If parameters are invalid.
 * @throws {Error} If the network request fails or returns a non-2xx status code.
 */
async function fetchAndSave(url, destPath) {
  if (typeof url !== 'string' || !url.trim()) {
    throw new TypeError('[EMG Core v49] Parameter "url" must be a non-empty string.');
  }
  if (typeof destPath !== 'string' || !destPath.trim()) {
    throw new TypeError('[EMG Core v49] Parameter "destPath" must be a non-empty string.');
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'EMG-Core-v49-Optimizer-Engine/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: Status Code ${response.status} (${response.statusText})`);
  }

  if (!response.body) {
    throw new Error(`Failed to fetch ${url}: Response body is null or undefined.`);
  }

  const writeStream = createWriteStream(destPath);

  try {
    // Stream response body to file with low memory overhead
    // @ts-ignore - Readable.fromWeb handles Web ReadableStream in Node.js environments
    await pipeline(Readable.fromWeb(response.body), writeStream);
  } catch (err) {
    if (!writeStream.destroyed) {
      writeStream.destroy();
    }
    throw err;
  }
}

/**
 * Executes the parallel retrieval of core remote architecture components.
 * 
 * @returns {Promise<void>}
 */
async function executeSynchronization() {
  /** @type {readonly DownloadTarget[]} */
  const targets = Object.freeze([
    {
      url: 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/App.tsx',
      dest: 'remote_App.tsx',
    },
    {
      url: 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/main.tsx',
      dest: 'remote_main.tsx',
    },
  ]);

  try {
    await Promise.all(targets.map((target) => fetchAndSave(target.url, target.dest)));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[EMG Core v49] Critical synchronization failure:', message);
    process.exitCode = 1;
  }
}

module.exports = {
  fetchAndSave,
  executeSynchronization,
};

void executeSynchronization();