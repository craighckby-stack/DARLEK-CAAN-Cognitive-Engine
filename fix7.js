const fs = require('fs');
let code = fs.readFileSync('src/app/api/evolution/propose/route.ts', 'utf8');
const idx = code.indexOf('${siphonedCodeContext}');
if (idx !== -1) {
  const start = code.substring(0, idx + 22);
  let rest = code.substring(idx + 22);
  rest = rest.replace('```', '\\`\\`\\`');
  code = start + rest;
}
fs.writeFileSync('src/app/api/evolution/propose/route.ts', code);
