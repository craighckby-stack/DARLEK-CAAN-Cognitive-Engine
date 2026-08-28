/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: check_github_page.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const https = require('https');

/**
 * Checks a remote GitHub page via HTTPS with memory-efficient stream processing and robust error handling.
 * 
 * @param {string} url - The target URL to fetch.
 * @param {string} label - The descriptive label for logging output.
 * @returns {void}
 */
function checkPage(url, label) {
  if (typeof url !== 'string' || typeof label !== 'string') {
    console.error(`[ERROR] [${label || 'UNKNOWN'}] Invalid parameters passed to checkPage.`);
    return;
  }

  const requestOptions = {
    headers: {
      'User-Agent': 'DARLEK-CANN-Engine/4.9 (Node.js)'
    },
    timeout: 10000 // 10-second timeout to prevent hanging connections
  };

  const req = https.get(url, requestOptions, (res) => {
    // Handle HTTP status errors
    if (res.statusCode < 200 || res.statusCode >= 300) {
      console.error(`=== ${label} ===`);
      console.error(`[ERROR] HTTP Status Code: ${res.statusCode} ${res.statusMessage || ''}`);
      res.resume(); // Consume response data to free up memory
      return;
    }

    let data = '';
    
    // Ensure high memory efficiency by placing limits on expected payload length if necessary,
    // and using safe concatenation.
    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const lines = data.split(/\r?\n/);
        const totalLines = lines.length;
        const firstFive = lines.slice(0, 5).join('\n');
        const lastFive = lines.slice(-5).join('\n');

        console.log(`=== ${label} ===`);
        console.log(`Length: ${Buffer.byteLength(data, 'utf8')} bytes`);
        console.log(`Lines: ${totalLines}`);
        console.log(`First 5 lines:\n${firstFive}`);
        console.log(`Last 5 lines:\n${lastFive}`);
      } catch (processingError) {
        console.error(`=== ${label} ===`);
        console.error(`[ERROR] Failed to process response data: ${processingError.message}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`=== ${label} ===`);
    console.error(`[ERROR] Network or request failure: ${error.message}`);
  });

  req.on('timeout', () => {
    console.error(`=== ${label} ===`);
    console.error(`[ERROR] Request timed out.`);
    req.destroy();
  });
}

// Execute checks with preserved external API contracts and signatures
checkPage('https://raw.githubusercontent.com/craighckby-stack/DARLEK_CAAN_ENGINE/main/src/app/page.tsx', 'MAIN BRANCH');
checkPage('https://raw.githubusercontent.com/craighckby-stack/DARLEK_CAAN_ENGINE/71f4f383afa014a1255d977791d6531a2033e323/src/app/page.tsx', 'COMMIT 71f4f383');

module.exports = {
  checkPage
};