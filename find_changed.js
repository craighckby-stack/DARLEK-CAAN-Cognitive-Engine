const fs = require('fs');
const https = require('https');
const path = require('path');
const crypto = require('crypto');

https.get('https://api.github.com/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1', { headers: { 'User-Agent': 'node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const tree = JSON.parse(data).tree;
    const remoteFiles = tree.filter(f => f.type === 'blob');
    
    function walk(dir) {
      let results = [];
      if (!fs.existsSync(dir)) return [];
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
          results = results.concat(walk(file));
        } else {
          results.push(file);
        }
      });
      return results;
    }
    const localFiles = walk('src');
    
    // We need to compare contents because git shas are blob shas (which include length headers).
    // Let's just download the remote files that are present locally and compare their text!
    fs.writeFileSync('remote_blobs.json', JSON.stringify(remoteFiles));
    console.log("Written blobs");
  });
});
