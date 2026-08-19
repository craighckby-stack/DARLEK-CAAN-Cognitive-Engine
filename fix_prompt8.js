const fs = require('fs');
const file = 'src/app/api/evolution/propose/route.ts';
let code = fs.readFileSync(file, 'utf8');

const regexToReplace = /\\`\\`\\`json\{/g;
code = code.replace(regexToReplace, "\\`\\`\\`json\\n{");

const regexToReplace2 = /\}\\`\\`\\`\\`\\`\\`tsx/g;
code = code.replace(regexToReplace2, "}\\n\\`\\`\\`\\n\\n\\`\\`\\`tsx\\n");

fs.writeFileSync(file, code);
