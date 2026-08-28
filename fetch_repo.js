/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fetch_repo.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const https = require('https');

/**
 * Interface specification for fetch options.
 * @typedef {Object} RequestOptions
 * @property {string} url - Target HTTP endpoint.
 * @property {number} timeout - Maximum duration in milliseconds before request abort.
 * @property {Record<string, string>} headers - Headers attached to outgoing request.
 */

/** @type {Readonly<RequestOptions>} */
const DEFAULT_CONFIG = Object.freeze({
  url: 'https://api.github.com/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1',
  timeout: 10000,
  headers: Object.freeze({
    'User-Agent': 'node.js',
    'Accept': 'application/vnd.github.v3+json'
  })
});

/**
 * Fetches repository payload asynchronously with optimized buffer allocation and robust error detection.
 * @param {string} [targetUrl=DEFAULT_CONFIG.url] - Target endpoint to fetch data from.
 * @returns {Promise<string>} Promise resolving to raw output string.
 */
function fetchRepositoryData(targetUrl = DEFAULT_CONFIG.url) {
  return new Promise((resolve, reject) => {
    const req = https.get(targetUrl, { headers: DEFAULT_CONFIG.headers }, (res) => {
      const statusCode = res.statusCode || 0;

      if (statusCode < 200 || statusCode >= 300) {
        // Free memory immediately when encountering HTTP error statuses
        res.resume();
        reject(new Error(`HTTP Request Failed with Status Code: ${statusCode}`));
        return;
      }

      /** @type {Buffer[]} */
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        try {
          const rawData = Buffer.concat(chunks).toString('utf8');
          resolve(rawData);
        } catch (parseError) {
          reject(parseError);
        }
      });

      res.on('error', (streamErr) => {
        reject(streamErr);
      });
    });

    req.on('error', (netErr) => {
      reject(netErr);
    });

    req.setTimeout(DEFAULT_CONFIG.timeout, () => {
      req.destroy(new Error(`Request timed out after ${DEFAULT_CONFIG.timeout}ms`));
    });
  });
}

/**
 * Main execution handler driving payload processing.
 */
(async function execute() {
  try {
    const data = await fetchRepositoryData();
    console.log(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(message);
  }
})();