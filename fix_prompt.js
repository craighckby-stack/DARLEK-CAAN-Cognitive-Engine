const fs = require('fs');
const file = 'src/app/api/evolution/propose/route.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /Your response MUST contain two parts:[\s\S]*?NO PLACEHOLDERS OR TRUNCATIONS"/;
code = code.replace(regex, `Your response MUST contain two parts:
1. A JSON object with your analysis and other metadata.
2. A Markdown code block containing the complete proposed code.

DO NOT put the proposed code inside the JSON object.

Format your response exactly like this:
\`\`\`json
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
\`\`\`

\`\`\`tsx
// Complete proposed code for the active file goes here.
// MUST BE COMPLETE FILE, NO PLACEHOLDERS OR TRUNCATIONS
\`\`\`
`);

// Also fix the other JSON object that was left behind
const regex2 = /,[\s]*"riskScore": 1-10,[\s]*"affectedFiles": \["list of other files that might be affected by this change"\],[\s]*"newFiles": \[[\s\S]*?\][\s]*\}/;
code = code.replace(regex2, '');

fs.writeFileSync(file, code);
