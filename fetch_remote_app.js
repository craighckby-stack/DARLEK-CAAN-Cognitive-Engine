/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fetch_remote_app.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const fs = require('node:fs/promises');
const https = require('node:https');
const { pipeline } = require('node:stream/promises');

/**
 * Fetches a remote resource securely and writes it to the specified destination path.
 * 
 * @param {string} url - The target HTTPS URL to fetch.
 * @param {string} destPath - The local file path to write the downloaded content.
 * @returns {Promise<void>}
 */
async function fetchAndSave(url, destPath) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'EMG-Core-v49-Optimizer-Engine/1.0',
      },
    };

    const req = https.get(url, options, async (res) => {
      try {
        if (res.statusCode !== 200) {
          throw new Error(`Failed to fetch ${url}: Status Code ${res.statusCode}`);
        }

        const fileHandle = await fs.open(destPath, 'w');
        const writeStream = fileHandle.createWriteStream();

        await pipeline(res, writeStream);
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

/**
 * Executes the parallel retrieval of core remote architecture components.
 * 
 * @returns {Promise<void>}
 */
async function executeSynchronization() {
  const targets = [
    {
      url: 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/App.tsx',
      dest: 'remote_App.tsx',
    },
    {
      url: 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/main.tsx',
      dest: 'remote_main.tsx',
    },
  ];

  try {
    await Promise.all(targets.map(target => fetchAndSave(target.url, target.dest)));
  } catch (error) {
    console.error('[EMG Core v49] Critical synchronization failure:', error.message);
    process.exitCode = 1;
  }
}

void executeSynchronization();