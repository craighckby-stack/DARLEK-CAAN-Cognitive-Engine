/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fix_prompt.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 * Optimized by EMG Core v49 Neural Code and Documentation Optimizer Engine.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Safely executes the prompt string replacement on the target route file
 * with robust error handling and explicit encoding management.
 */
function executePromptFix() {
  const targetFile = path.resolve('src/app/api/evolution/propose/route.ts');

  try {
    if (!fs.existsSync(targetFile)) {
      throw new Error(`Target evolution route file not found at: ${targetFile}`);
    }

    let code = fs.readFileSync(targetFile, 'utf8');

    const primaryRegex = /Your response MUST contain two parts:[\s\S]*?NO PLACEHOLDERS OR TRUNCATIONS"/;
    const replacementText = `Your response MUST contain two parts:
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
\`\`\``;

    if (!primaryRegex.test(code)) {
      console.warn('[EMG Warning] Primary prompt pattern not found in target file. Skipping primary replacement.');
    } else {
      code = code.replace(primaryRegex, replacementText);
    }

    const secondaryRegex = /,[\s]*"riskScore": 1-10,[\s]*"affectedFiles": \["list of other files that might be affected by this change"\],[\s]*"newFiles": \[[\s\S]*?\][\s]*\}/;
    if (secondaryRegex.test(code)) {
      code = code.replace(secondaryRegex, '');
    }

    fs.writeFileSync(targetFile, code, 'utf8');
    console.log(`[EMG Success] Successfully optimized and updated prompt structures in ${targetFile}`);
  } catch (error) {
    console.error(`[EMG Error] Failed to execute prompt fix: ${error.message}`);
    process.exitCode = 1;
  }
}

executePromptFix();