const fs = require('fs');
const https = require('https');

https.get('https://api.github.com/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1', { headers: { 'User-Agent': 'node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const tree = JSON.parse(data).tree;
    const remoteFiles = tree.filter(f => f.type === 'blob').map(f => f.path);
    
    const path = require('path');
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
    
    console.log("Files in remote but not local:");
    remoteFiles.forEach(f => {
      if (!localFiles.includes(f) && f.startsWith('src/')) {
        console.log("  " + f);
      }
    });

    console.log("\nFiles in local but not remote:");
    localFiles.forEach(f => {
      if (!remoteFiles.includes(f)) {
        console.log("  " + f);
      }
    });
  });
});
