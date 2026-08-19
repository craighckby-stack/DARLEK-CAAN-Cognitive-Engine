const fs = require('fs');
const https = require('https');

https.get('https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/App.tsx', { headers: { 'User-Agent': 'node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => fs.writeFileSync('remote_App.tsx', data));
});

https.get('https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/main.tsx', { headers: { 'User-Agent': 'node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => fs.writeFileSync('remote_main.tsx', data));
});
