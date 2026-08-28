/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fetch_siphon.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const https = require('node:https');

/**
 * Operational constants for the network transaction.
 */
const SIPHON_ENDPOINT = 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/utils/siphon.ts';
const TIMEOUT_MS = 10000;
const REQUEST_HEADERS = Object.freeze({
  'User-Agent': 'EMG-Core-Neural-Optimizer/4.9',
  'Accept': 'text/plain,application/typescript'
});

/**
 * Fetches the remote siphon utility script with robust error handling and stream management.
 * @returns {Promise<void>} Resolves when the payload is successfully outputted to stdout.
 */
async function fetchSiphon() {
  if (typeof globalThis.fetch === 'function') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error('Network operation timed out.'));
    }, TIMEOUT_MS);

    try {
      const response = await globalThis.fetch(SIPHON_ENDPOINT, {
        headers: REQUEST_HEADERS,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP Operation Failed: Status Code ${response.status}`);
      }

      const text = await response.text();
      process.stdout.write(text + (text.endsWith('\n') ? '' : '\n'));
    } finally {
      clearTimeout(timeoutId);
    }
    return;
  }

  return new Promise((resolve, reject) => {
    const req = https.get(
      SIPHON_ENDPOINT,
      { headers: REQUEST_HEADERS, timeout: TIMEOUT_MS },
      (res) => {
        const { statusCode } = res;

        if (statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP Operation Failed: Status Code ${statusCode}`));
        }

        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          try {
            const data = Buffer.concat(chunks).toString('utf8');
            process.stdout.write(data + (data.endsWith('\n') ? '' : '\n'));
            resolve();
          } catch (err) {
            reject(err);
          }
        });

        res.on('error', reject);
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('Network operation timed out.'));
    });
  });
}

// Execute immediately to preserve operational signature
fetchSiphon().catch((err) => {
  console.error(`[EMG-CRITICAL-ERROR]: ${err.message}`);
  process.exitCode = 1;
});

module.exports = { fetchSiphon };