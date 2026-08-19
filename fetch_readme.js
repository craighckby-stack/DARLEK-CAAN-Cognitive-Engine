const https = require('https');

https.get('https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/README.md', { headers: { 'User-Agent': 'node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', err => console.log(err.message));
