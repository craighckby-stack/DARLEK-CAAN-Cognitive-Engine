const fs = require('fs');
const file = 'src/app/api/evolution/propose/route.ts';
let code = fs.readFileSync(file, 'utf8');

const targetStr = "}``````tsx// Complete proposed code for the active file goes here.// MUST BE COMPLETE FILE, NO PLACEHOLDERS OR TRUNCATIONS```";
const replacementStr = "\n`";

code = code.replace(targetStr, replacementStr);
fs.writeFileSync(file, code);
