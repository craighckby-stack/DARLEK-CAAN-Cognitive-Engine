/**
 * EMG Core v49 Neural Code and Documentation Optimizer Engine
 * File Path: "patch_prompt_json.js"
 * Optimization: Comprehensive Refactoring for Safety, Type-Safety, and Performance
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Executes a robust, fault-tolerant text replacement on the target source file.
 * 
 * @param {string} targetFilePath - Relative or absolute path to the file to patch.
 * @returns {void}
 * @throws {Error} If file reading or writing fails.
 */
function patchPromptJson(targetFilePath) {
  const resolvedPath = path.resolve(targetFilePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`[EMG-v49] Critical Error: Target file not found at path -> ${resolvedPath}`);
  }

  // Read file with explicit utf-8 encoding and optimized memory handling
  let code = fs.readFileSync(resolvedPath, { encoding: 'utf8' });

  const targetString1 = 'Your response MUST be in this exact JSON format (no markdown, no code fences):';
  const replacementString1 = `Your response MUST contain two parts:
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

  if (code.includes(targetString1)) {
    code = code.replace(targetString1, replacementString1);
  }

  const regexPattern2 = /\{\s*"analysis": "Specific analysis[\s\S]*?"newFiles": \[\s*\{\s*"path": "relative\/path\/to\/new-file\.ts",\s*"content": "Full source code content of the new file to create"\s*\}\s*\]\s*\}/;
  if (regexPattern2.test(code)) {
    code = code.replace(regexPattern2, '');
  }

  const targetString3 = 'Your response MUST be in this exact JSON format:{';
  const replacementString3 = 'Your response MUST contain a JSON block and a Code block:';
  if (code.includes(targetString3)) {
    code = code.replace(targetString3, replacementString3);
  }

  // Safely write the updated source code back to disk
  fs.writeFileSync(resolvedPath, code, { encoding: 'utf8' });
}

// Module Execution Guard
try {
  const fileToPatch = 'src/app/api/evolution/propose/route.ts';
  patchPromptJson(fileToPatch);
} catch (error) {
  console.error(`[EMG-v49] Execution Failed:`, error instanceof Error ? error.message : error);
  process.exit(1);
}