/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: check_github_page.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

const https = require('https');

function checkPage(url, label) {
  https.get(url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`=== ${label} ===`);
      console.log(`Length: ${data.length} bytes`);
      console.log(`Lines: ${data.split('\n').length}`);
      console.log(`First 5 lines:\n`, data.split('\n').slice(0, 5).join('\n'));
      console.log(`Last 5 lines:\n`, data.split('\n').slice(-5).join('\n'));
    });
  });
}

checkPage('https://raw.githubusercontent.com/craighckby-stack/DARLEK_CAAN_ENGINE/main/src/app/page.tsx', 'MAIN BRANCH');
checkPage('https://raw.githubusercontent.com/craighckby-stack/DARLEK_CAAN_ENGINE/71f4f383afa014a1255d977791d6531a2033e323/src/app/page.tsx', 'COMMIT 71f4f383');
