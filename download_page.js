/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: download_page.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

const commitSha = '71f4f383afa014a1255d977791d6531a2033e323';
const url = `https://raw.githubusercontent.com/craighckby-stack/DARLEK_CAAN_ENGINE/${commitSha}/src/app/page.tsx`;
const targetPath = 'src/app/page.tsx';
const minLineCountThreshold = 1000;

console.log(`Downloading page.tsx from commit ${commitSha}...`);

/**
 * Performs an HTTPS GET request wrapped in a Promise interface with memory-efficient chunk buffering and status checks.
 * @param {string} requestUrl - The HTTPS endpoint URL to fetch data from.
 * @returns {Promise<string>} The retrieved response body as a string.
 */
function fetchContent(requestUrl) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'node.js'
      }
    };

    const req = https.get(requestUrl, options, (res) => {
      const { statusCode } = res;

      if (statusCode !== 200) {
        res.resume(); // Consume response stream to prevent memory leakage
        return reject(new Error(`Server returned HTTP status ${statusCode}`));
      }

      res.setEncoding('utf8');
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        resolve(chunks.join(''));
      });

      res.on('error', (err) => {
        reject(err);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

/**
 * Main execution routine handling file download, verification, and filesystem operations.
 * @returns {Promise<void>}
 */
async function executeDownloadPipeline() {
  try {
    const data = await fetchContent(url);
    const lines = data.split('\n');

    console.log(`Downloaded ${lines.length} lines. First 5 lines:`);
    console.log(lines.slice(0, 5).join('\n'));

    if (lines.length > minLineCountThreshold) {
      const targetDirectory = path.dirname(targetPath);
      if (!fs.existsSync(targetDirectory)) {
        fs.mkdirSync(targetDirectory, { recursive: true });
      }

      fs.writeFileSync(targetPath, data, 'utf8');
      console.log("Successfully restored src/app/page.tsx from commit 71f4f383!");
    } else {
      console.log("Warning: Downloaded file has less than 1000 lines, did not overwrite local file.");
    }
  } catch (err) {
    const errorMessage = err && typeof err === 'object' && 'message' in err ? err.message : String(err);
    console.error("Error downloading file:", errorMessage);
  }
}

executeDownloadPipeline();