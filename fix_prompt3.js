/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fix_prompt3.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Executes a robust string replacement within the specified target file
 * to correct prompt formatting artifacts.
 * 
 * @throws {Error} If file reading, replacement, or writing fails.
 */
function optimizeRoutePrompt() {
    const targetFilePath = path.resolve('src/app/api/evolution/propose/route.ts');

    try {
        // Read file with explicit UTF-8 encoding for memory efficiency and safety
        const code = fs.readFileSync(targetFilePath, 'utf8');

        const targetStr = "\\`\\`\\`json\\n{\\n  \\\"analysis\\\": \\\"Specific analysis of what dead-weight or bugs were fixed...\\\",\\n  \\\"riskScore\\\": 1,\\n  \\\"affectedFiles\\\": [\\\"list of other files\\\"],\\n  \\\"newFiles\\\": [\\n    {\\n      \\\"path\\\": \\\"relative/path/to/new-file.ts\\\",\\n      \\\"content\\\": \\\"Full source code content of the new file to create\\\"\\n    }\\n  ]\\n}\\n\\`\\`\\`\\n\\n\\`\\`\\`tsx\\n// Complete proposed code for the active file goes here.\\n// MUST BE COMPLETE FILE, NO PLACEHOLDERS OR TRUNCATIONS\\n\\`\\`\\`}``````tsx// Complete proposed code for the active file goes here.// MUST BE COMPLETE FILE, NO PLACEHOLDERS OR TRUNCATIONS```";
        const replacementStr = "\\`\\`\\`json\\n{\\n  \\\"analysis\\\": \\\"Specific analysis of what dead-weight or bugs were fixed...\\\",\\n  \\\"riskScore\\\": 1,\\n  \\\"affectedFiles\\\": [\\\"list of other files\\\"],\\n  \\\"newFiles\\\": [\\n    {\\n      \\\"path\\\": \\\"relative/path/to/new-file.ts\\\",\\n      \\\"content\\\": \\\"Full source code content of the new file to create\\\"\\n    }\\n  ]\\n}\\n\\`\\`\\`\\n\\n\\`\\`\\`tsx\\n// Complete proposed code for the active file goes here.\\n// MUST BE COMPLETE FILE, NO PLACEHOLDERS OR TRUNCATIONS\\n\\`\\`\\`\\n`";

        if (!code.includes(targetStr)) {
            console.warn('[EMG Core v49] Warning: Target string for replacement not found in file. No changes made.');
            return;
        }

        const updatedCode = code.replace(targetStr, replacementStr);

        fs.writeFileSync(targetFilePath, updatedCode, 'utf8');
        console.log('[EMG Core v49] Successfully updated: ' + targetFilePath);
    } catch (error) {
        console.error('[EMG Core v49] Critical Error during file transformation:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

optimizeRoutePrompt();