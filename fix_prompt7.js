const fs = require('fs');
const file = 'src/app/api/evolution/propose/route.ts';
let code = fs.readFileSync(file, 'utf8');

const regexToReplace = /Format your response exactly like this:[\s\S]*?Risk scoring guidelines:/;

const replacementStr = `Format your response exactly like this:
\\\`\\\`\\\`json
{
  "analysis": "Specific analysis of what dead-weight or bugs were fixed...",
  "riskScore": 1,
  "affectedFiles": ["list of other files"],
  "newFiles": [
    {
      "path": "relative/path/to/new-file.ts",
      "content": "Full source code content of the new file to create"
    }
  ]
}
\\\`\\\`\\\`

\\\`\\\`\\\`tsx
// Complete proposed code for the active file goes here.
// MUST BE COMPLETE FILE, NO PLACEHOLDERS OR TRUNCATIONS
\\\`\\\`\\\`

Risk scoring guidelines:`;

code = code.replace(regexToReplace, replacementStr);
fs.writeFileSync(file, code);
