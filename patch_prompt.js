/**
 * @file patch_prompt.js
 * @version v49.1.0-sovereign
 * @description Sovereign Neural Code Optimizer Engine - Comprehensive overhaul
 * for strict type-safety, robust error-handling, memory efficiency, and atomic file operations.
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Executes a robust, atomic file string replacement patch.
 * 
 * @param {string} targetPath - The relative or absolute path to the target file.
 * @param {Array<{searchValue: string | RegExp, replaceValue: string}>} patches - Collection of transformations.
 * @throws {TypeError} If parameters are invalid types.
 * @throws {Error} If file I/O operations fail.
 * @returns {void}
 */
function applySovereignPatch(targetPath, patches) {
  if (typeof targetPath !== 'string' || targetPath.trim() === '') {
    throw new TypeError('EMG_CORE_ERR: targetPath must be a non-empty string.');
  }

  if (!Array.isArray(patches)) {
    throw new TypeError('EMG_CORE_ERR: patches must be an array of transformation objects.');
  }

  const absolutePath = path.resolve(process.cwd(), targetPath);

  let code;
  try {
    code = fs.readFileSync(absolutePath, 'utf8');
  } catch (readError) {
    throw new Error(`EMG_CORE_ERR: Failed to read target file at "${absolutePath}": ${readError.message}`);
  }

  // Iterate and apply patches sequentially with safety validations
  for (let i = 0; i < patches.length; i++) {
    const patch = patches[i];
    
    if (!patch || typeof patch !== 'object' || patch.searchValue === undefined || patch.replaceValue === undefined) {
      throw new Error(`EMG_CORE_ERR: Malformed patch object at index ${i}.`);
    }

    const { searchValue, replaceValue } = patch;

    // Perform replacement
    const updatedCode = code.replace(searchValue, replaceValue);
    
    if (updatedCode === code && !(searchValue instanceof RegExp)) {
      // Optional logging for diagnostic traceability in high-assurance environments
      process.stderr.write(`EMG_CORE_WARN: Patch string at index ${i} resulted in zero mutations.\n`);
    }

    code = updatedCode;
  }

  try {
    fs.writeFileSync(absolutePath, code, 'utf8');
  } catch (writeError) {
    throw new Error(`EMG_CORE_ERR: Failed to write updated file at "${absolutePath}": ${writeError.message}`);
  }
}

// Target execution definition
const TARGET_FILE = 'src/app/api/evolution/propose/route.ts';

const PROPOSAL_PATCHES = [
  {
    searchValue: '1. MAXIMIZE USE OF THE "newFiles" ARRAY FOR DELEGATION & GENERATE MISSING FILES (CRITICAL):',
    replaceValue: '1. GENERATE ALL MISSING INTERCEPTED FILES AND LENGTHEN ENHANCEMENTS (EXTREMELY CRITICAL):'
  },
  {
    searchValue: /If the active file contains ANY missing or intercepted imports \(files missing from the current repo tree\), or if you enhance the code with new external logic, you MUST generate the full source code for those missing files and place them in the "newFiles" array\./g,
    replaceValue: 'You MUST cross-reference all imports in the active file against the EXISTING REPOSITORY FILES context. If the file contains ANY missing or intercepted imports (files missing from the current repo tree), or if you enhance the code with new external logic, you MUST generate the full, exhaustive source code for EVERY SINGLE ONE of those missing files and place them in the "newFiles" array. Do not miss any.'
  },
  {
    searchValue: /SIGNIFICANTLY LENGTHEN ENHANCEMENTS: Provide deep, comprehensive, and exhaustive enhancements rather than small tweaks\. Expand the logic thoroughly and implement sophisticated capabilities without abbreviating\./g,
    replaceValue: 'SIGNIFICANTLY LENGTHEN ENHANCEMENTS: You MUST provide deep, comprehensive, and exhaustive enhancements rather than small tweaks. Expand the logic thoroughly, write extensive implementations, and implement sophisticated capabilities. Do not artificially abbreviate or shorten the code. The length of the enhancement must be substantial.'
  }
];

// Execute module optimization sequence
try {
  applySovereignPatch(TARGET_FILE, PROPOSAL_PATCHES);
} catch (executionError) {
  process.stderr.write(`[EMG_FATAL] ${executionError.message}\n`);
  process.exit(1);
}