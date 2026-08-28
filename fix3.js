/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fix3.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Sovereign, type-safe, resilient file transformation module.
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Pattern configuration interface for code transformations.
 * @typedef {Object} TransformationConfig
 * @property {string} relativePath - Target file path relative to current working directory.
 * @property {RegExp} pattern - Regular expression matching target pattern.
 * @property {string} replacement - Escaped replacement string.
 */

/** @type {Readonly<TransformationConfig>} */
const CONFIG = Object.freeze({
  relativePath: 'src/app/api/evolution/propose/route.ts',
  pattern: /siphonedCodeContext\}\n```\n\$\{fileContent/g,
  replacement: 'siphonedCodeContext}\n\\`\\`\\`\n${fileContent',
});

/**
 * Executes an idempotent, resilient code patch operation on the target route file.
 * Performs path resolution, existence checks, zero-write bypass, and comprehensive error containment.
 * 
 * @returns {boolean} True if the file was modified, false otherwise.
 */
function applyEvolutionPatch() {
  const resolvedPath = path.resolve(process.cwd(), CONFIG.relativePath);

  try {
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`[EMG Core] Target file omitted - non-existent path: "${resolvedPath}"`);
      return false;
    }

    const sourceContent = fs.readFileSync(resolvedPath, 'utf8');

    if (!CONFIG.pattern.test(sourceContent)) {
      console.log(`[EMG Core] Target pattern not detected in "${CONFIG.relativePath}". Operations skipped.`);
      return false;
    }

    // Reset regex index state prior to replacement
    CONFIG.pattern.lastIndex = 0;
    const transformedContent = sourceContent.replace(CONFIG.pattern, CONFIG.replacement);

    if (transformedContent !== sourceContent) {
      fs.writeFileSync(resolvedPath, transformedContent, 'utf8');
      console.log(`[EMG Core] Sovereign transformation applied successfully to "${CONFIG.relativePath}".`);
      return true;
    }

    return false;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[EMG Core] Critical failure during file transformation execution: ${err.message}`, err.stack);
    process.exitCode = 1;
    return false;
  }
}

applyEvolutionPatch();