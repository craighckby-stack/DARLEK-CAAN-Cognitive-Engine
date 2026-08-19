const fs = require('fs');
const file = 'src/app/api/evolution/propose/route.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `let proposedCode = parsed?.proposedCode;`,
  `if (!parsed) console.log('[Propose] JSON parse failed. rawText length:', rawText.length, 'preview:', rawText.slice(0, 200));\n    let proposedCode = parsed?.proposedCode;`
);

code = code.replace(
  `proposedCode = fileContent;`,
  `console.log('[Propose] Fallback matched no code fences. Using fileContent.');\n        proposedCode = fileContent;`
);

fs.writeFileSync(file, code);
