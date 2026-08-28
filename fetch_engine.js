/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fetch_engine.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

// @ts-check

'use strict';

const https = require('node:https');
const { URL } = require('node:url');

/**
 * Maximum safety threshold for response payload in characters (1MB).
 * @type {number}
 */
const MAX_PAYLOAD_LIMIT = 1048576;

/**
 * Output display character limit.
 * @type {number}
 */
const OUTPUT_LIMIT = 4000;

/**
 * Network request timeout duration in milliseconds.
 * @type {number}
 */
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Immutable headers configured for network requests.
 * @type {Readonly<Record<string, string>>}
 */
const DEFAULT_HEADERS = Object.freeze({
  'User-Agent': 'EMG-Core-v49-Neural-Code-Optimizer',
  'Accept': 'text/plain,application/json,*/*'
});

/**
 * Safely fetches and streams a remote resource with robust error handling and memory optimization.
 * @param {string} targetUrl - The URL to fetch data from.
 * @returns {Promise<void>} Resolves when resource fetching and processing complete successfully.
 */
function executeFetchEngine(targetUrl) {
  return new Promise((resolve, reject) => {
    if (typeof targetUrl !== 'string' || targetUrl.trim() === '') {
      return reject(new TypeError('Target URL must be a non-empty string.'));
    }

    /** @type {URL} */
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch (urlError) {
      return reject(new TypeError(`Invalid Target URL provided: ${/** @type {Error} */ (urlError).message}`));
    }

    const options = {
      headers: DEFAULT_HEADERS
    };

    /** @type {boolean} */
    let isSettled = false;

    /**
     * Rejects the promise once and guarantees single settlement state.
     * @param {Error} err - The error object to reject with.
     */
    const fail = (err) => {
      if (!isSettled) {
        isSettled = true;
        reject(err);
      }
    };

    /**
     * Resolves the promise once and guarantees single settlement state.
     */
    const succeed = () => {
      if (!isSettled) {
        isSettled = true;
        resolve();
      }
    };

    const req = https.get(parsedUrl, options, (res) => {
      const statusCode = res.statusCode ?? 0;

      // Validate HTTP status code
      if (statusCode < 200 || statusCode >= 300) {
        res.resume(); // Consume response data to free up memory
        return fail(new Error(`HTTP Request Failed. Status Code: ${statusCode}`));
      }

      // Enforce strict encoding to prevent buffer corruption
      res.setEncoding('utf8');

      /** @type {string[]} */
      const chunks = [];
      let totalLength = 0;

      res.on('data', (chunk) => {
        if (isSettled) return;

        totalLength += chunk.length;
        if (totalLength > MAX_PAYLOAD_LIMIT) {
          res.destroy(new Error('Payload size exceeded maximum safety threshold.'));
          return;
        }

        chunks.push(chunk);
      });

      res.on('error', (resErr) => {
        fail(new Error(`Network transmission error: ${resErr.message}`));
      });

      res.on('end', () => {
        if (isSettled) return;

        try {
          const fullData = chunks.join('');
          const output = fullData.substring(0, OUTPUT_LIMIT);
          console.log(output);
          succeed();
        } catch (err) {
          fail(/** @type {Error} */ (err));
        }
      });
    });

    req.on('error', (err) => {
      fail(new Error(`Network transmission error: ${err.message}`));
    });

    // Set request timeout for resilience
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms.`));
    });
  });
}

// Execute core operation with unhandled rejection safety
executeFetchEngine('https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/utils/engine.ts')
  .catch((err) => {
    console.error(`[EMG-CRITICAL-ERROR]: ${err.message}`);
    process.exitCode = 1;
  });