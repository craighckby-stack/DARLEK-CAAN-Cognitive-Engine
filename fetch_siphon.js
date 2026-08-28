/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fetch_siphon.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const https = require('https');

/**
 * Fetches the remote siphon utility script with robust error handling and stream management.
 * @returns {Promise<void>}
 */
function fetchSiphon() {
  return new Promise((resolve, reject) => {
    const url = 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/utils/siphon.ts';
    const options = {
      headers: {
        'User-Agent': 'EMG-Core-Neural-Optimizer/4.9',
        'Accept': 'text/plain,application/typescript'
      },
      timeout: 10000
    };

    const req = https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        res.resume(); // Consume response data to free up memory
        return reject(new Error(`HTTP Operation Failed: Status Code ${res.statusCode}`));
      }

      // Use an array to buffer chunks efficiently before joining, avoiding O(N^2) string concatenation
      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        try {
          const data = Buffer.concat(chunks).toString('utf8');
          process.stdout.write(data + '\n');
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy(new Error('Network operation timed out.'));
    });
  });
}

// Execute immediately to preserve operational signature
fetchSiphon().catch((err) => {
  console.error(`[EMG-CRITICAL-ERROR]: ${err.message}`);
  process.exitCode = 1;
});