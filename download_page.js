/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: download_page.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

const https = require('https');
const fs = require('fs');

const commitSha = '71f4f383afa014a1255d977791d6531a2033e323';
const url = `https://raw.githubusercontent.com/craighckby-stack/DARLEK_CAAN_ENGINE/${commitSha}/src/app/page.tsx`;

console.log(`Downloading page.tsx from commit ${commitSha}...`);

https.get(url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n');
    console.log(`Downloaded ${lines.length} lines. First 5 lines:`);
    console.log(lines.slice(0, 5).join('\n'));
    
    if (lines.length > 1000) {
      fs.writeFileSync('src/app/page.tsx', data);
      console.log("Successfully restored src/app/page.tsx from commit 71f4f383!");
    } else {
      console.log("Warning: Downloaded file has less than 1000 lines, did not overwrite local file.");
    }
  });
}).on('error', err => {
  console.error("Error downloading file:", err.message);
});
