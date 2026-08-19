const fs = require('fs');
let code = fs.readFileSync('src/app/api/evolution/propose/route.ts', 'utf8');
code = code.replace(/siphonedCodeContext\}\r?\n```\r?\n\$\{fileContent/g, "siphonedCodeContext}\n\\`\\`\\`\n${fileContent");
// Also just in case, look for the unescaped backticks in general near fileContent
code = code.replace(/```\$\{fileContent/g, "\\`\\`\\`${fileContent");
fs.writeFileSync('src/app/api/evolution/propose/route.ts', code);
