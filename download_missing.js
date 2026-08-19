const fs = require('fs');
const https = require('https');
const path = require('path');

const missing = JSON.parse(fs.readFileSync('missing_files.json', 'utf8'));
let count = 0;

function download(fileObj) {
  return new Promise((resolve) => {
    https.get('https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/' + fileObj.path, { headers: { 'User-Agent': 'node.js' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const dir = path.dirname(fileObj.path);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        // Skip .md docs if they clash or are not strictly code needed immediately (actually let's just write them)
        fs.writeFileSync(fileObj.path, data);
        console.log("Downloaded " + fileObj.path);
        resolve();
      });
    }).on('error', err => {
      console.log('Error downloading ' + fileObj.path + ': ' + err.message);
      resolve();
    });
  });
}

async function doAll() {
  for (const f of missing) {
    if (f.path.startsWith('src/')) {
       await download(f);
       count++;
    }
  }
  console.log(`Downloaded ${count} files.`);
}

doAll();
