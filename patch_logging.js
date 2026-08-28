/**
 * @file patch_logging.js
 * @module EMG/Core/v49/NeuralCodeOptimizer
 * @description Sovereign Overhaul - High-performance file patch utility with robust error handling and strict type-safety.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Executes a targeted string replacement patch on a specific target file.
 * 
 * @function patchLogging
 * @throws {Error} If the target file cannot be read or written securely.
 * @returns {void}
 */
function patchLogging() {
    const targetFile = path.normalize('src/app/api/evolution/propose/route.ts');

    try {
        // Read file with explicit UTF-8 encoding
        const originalCode = fs.readFileSync(targetFile, 'utf8');

        const targetSearch1 = 'let proposedCode = parsed?.proposedCode;';
        const targetReplacement1 = "if (!parsed) console.log('[Propose] JSON parse failed. rawText length:', rawText.length, 'preview:', rawText.slice(0, 200));\n    let proposedCode = parsed?.proposedCode;";

        const targetSearch2 = 'proposedCode = fileContent;';
        const targetReplacement2 = "console.log('[Propose] Fallback matched no code fences. Using fileContent.');\n        proposedCode = fileContent;";

        // Validate existence of targets before replacing to prevent silent failures
        if (!originalCode.includes(targetSearch1)) {
            console.warn(`[EMG-v49] Warning: Target signature 1 not found in ${targetFile}`);
        }
        if (!originalCode.includes(targetSearch2)) {
            console.warn(`[EMG-v49] Warning: Target signature 2 not found in ${targetFile}`);
        }

        const updatedCode = originalCode
            .replace(targetSearch1, targetReplacement1)
            .replace(targetSearch2, targetReplacement2);

        // Atomic-like write operation
        fs.writeFileSync(targetFile, updatedCode, 'utf8');
        console.log(`[EMG-v49] Successfully patched target file: ${targetFile}`);
    } catch (error) {
        console.error(`[EMG-v49] Critical execution failure during patching of ${targetFile}:`, error.message);
        process.exitCode = 1;
        throw error;
    }
}

patchLogging();