/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: compare.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const fs = require('fs');
const https = require('https');
const path = require('path');

/**
 * Recursively walks a directory to collect all file paths synchronously.
 * @param {string} dir - The directory path to walk.
 * @returns {string[]} Array of normalized file paths.
 */
function walk(dir) {
  let results = [];
  try {
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        results = results.concat(walk(filePath));
      } else {
        results.push(filePath.replace(/\\/g, '/'));
      }
    }
  } catch (error) {
    console.error(`[EMG Error] Failed to read directory ${dir}:`, error.message);
  }
  return results;
}

const options = {
  hostname: 'api.github.com',
  path: '/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1',
  headers: { 
    'User-Agent': 'EMG-Core-v49-Neural-Code-Optimizer',
    'Accept': 'application/vnd.github.v3+json'
  }
};

https.get(options, (res) => {
  if (res.statusCode !== 200) {
    console.error(`[EMG Error] GitHub API returned status code: ${res.statusCode}`);
    res.resume();
    return;
  }

  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed || !Array.isArray(parsed.tree)) {
        console.error('[EMG Error] Invalid JSON structure received from GitHub API.');
        return;
      }

      const remoteFiles = parsed.tree.filter(f => f.type === 'blob').map(f => f.path);
      const localFiles = walk('src');

      const remoteSet = new Set(remoteFiles);
      const localSet = new Set(localFiles);

      console.log('Files in remote but not local:');
      for (const f of remoteFiles) {
        if (!localSet.has(f) && f.startsWith('src/')) {
          console.log('  ' + f);
        }
      }

      console.log('\nFiles in local but not remote:');
      for (const f of localFiles) {
        if (!remoteSet.has(f)) {
          console.log('  ' + f);
        }
      }
    } catch (error) {
      console.error('[EMG Error] Failed to parse API response payload:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('[EMG Error] Network transmission failure:', error.message);
});