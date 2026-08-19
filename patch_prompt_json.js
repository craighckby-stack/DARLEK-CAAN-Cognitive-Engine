const fs = require('fs');
const file = 'src/app/api/evolution/propose/route.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `Your response MUST be in this exact JSON format (no markdown, no code fences):`,
  `Your response MUST contain two parts:
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
\`\`\``
);

code = code.replace(
  /\{\s*"analysis": "Specific analysis[\s\S]*?"newFiles": \[\s*\{\s*"path": "relative\/path\/to\/new-file\.ts",\s*"content": "Full source code content of the new file to create"\s*\}\s*\]\s*\}/,
  ""
);

code = code.replace(
  `Your response MUST be in this exact JSON format:{`,
  `Your response MUST contain a JSON block and a Code block:`
);

fs.writeFileSync(file, code);
