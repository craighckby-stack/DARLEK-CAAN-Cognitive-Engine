const fs = require('fs');
const https = require('https');

const remoteBlobs = JSON.parse(fs.readFileSync('remote_blobs.json', 'utf8'));
let changed = [];

const promises = remoteBlobs.filter(f => f.path.startsWith('src/') && fs.existsSync(f.path)).map(fileObj => {
  return new Promise((resolve) => {
    const localContent = fs.readFileSync(fileObj.path, 'utf8');
    https.get('https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/' + fileObj.path, { headers: { 'User-Agent': 'node.js' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data !== localContent) {
           console.log("Changed: " + fileObj.path);
           changed.push(fileObj);
           fs.writeFileSync(fileObj.path, data);
        }
        resolve();
      });
    }).on('error', () => resolve());
  });
});

Promise.all(promises).then(() => {
   console.log(`Found and updated ${changed.length} changed files.`);
});
