const https = require('https');
const fs = require('fs');
const path = require('path');

const owner = 'craighckby-stack';
const repo = 'DARLEK_CAAN_ENGINE';
const branch = 'main';

https.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers: { 'User-Agent': 'node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const tree = JSON.parse(data).tree;
    if (!tree) { console.error("No tree found"); return; }
    
    // We only restore src/ branch because package.json might have changed
    const srcFiles = tree.filter(f => f.type === 'blob' && f.path.startsWith('src/'));
    console.log("Restoring " + srcFiles.length + " files from " + repo);
    
    let index = 0;
    function downloadNext() {
      if (index >= srcFiles.length) {
         console.log("ALL RESTORED!");
         return;
      }
      const file = srcFiles[index++];
      // Create subdirectories
      const dir = path.dirname(file.path);
      fs.mkdirSync(dir, { recursive: true });

      https.get(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`, { headers: { 'User-Agent': 'node.js' } }, (fileRes) => {
         let content = '';
         fileRes.on('data', c => content += c);
         fileRes.on('end', () => {
            fs.writeFileSync(file.path, content);
            downloadNext();
         });
      }).on('error', () => downloadNext());
    }
    downloadNext();
  });
});
