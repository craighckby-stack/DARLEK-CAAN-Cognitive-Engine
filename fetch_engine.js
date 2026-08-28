/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fetch_engine.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const https = require('https');

/**
 * Safely fetches and streams a remote resource with robust error handling and memory optimization.
 * @param {string} targetUrl - The URL to fetch data from.
 * @returns {Promise<void>}
 */
function executeFetchEngine(targetUrl) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'EMG-Core-v49-Neural-Code-Optimizer',
        'Accept': 'text/plain,application/json,*/*'
      }
    };

    const req = https.get(targetUrl, options, (res) => {
      // Validate HTTP status code
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        res.resume(); // Consume response data to free up memory
        return reject(new Error(`HTTP Request Failed. Status Code: ${res.statusCode}`));
      }

      // Enforce strict encoding to prevent buffer corruption
      res.setEncoding('utf8');

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
        // Prevent memory overflow by capping accumulated string length if necessary
        if (data.length > 1048576) { // 1MB safety threshold
          res.destroy(new Error('Payload size exceeded maximum safety threshold.'));
        }
      });

      res.on('end', () => {
        try {
          const output = data.substring(0, 4000);
          console.log(output);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Network transmission error: ${err.message}`));
    });

    // Set request timeout for resilience
    req.setTimeout(10000, () => {
      req.destroy(new Error('Request timed out after 10000ms.'));
    });
  });
}

// Execute core operation with unhandled rejection safety
executeFetchEngine('https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/utils/engine.ts')
  .catch((err) => {
    console.error(`[EMG-CRITICAL-ERROR]: ${err.message}`);
    process.exitCode = 1;
  });