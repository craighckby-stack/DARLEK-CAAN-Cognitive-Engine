const https = require('https');

https.get('https://api.github.com/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1', { headers: { 'User-Agent': 'node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', err => console.log(err.message));
