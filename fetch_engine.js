const https = require('https');

https.get('https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/utils/engine.ts', { headers: { 'User-Agent': 'node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data.substring(0, 4000))); // Print chunks
}).on('error', err => console.log(err.message));
