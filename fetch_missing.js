const fs = require('fs');
const https = require('https');
const path = require('path');

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
    
    const missing = remoteFiles.filter(f => !localFiles.includes(f.path) && f.path.startsWith('src/'));
    
    fs.writeFileSync('missing_files.json', JSON.stringify(missing));
    console.log(`Found ${missing.length} missing files.`);
  });
});
