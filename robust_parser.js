/**
 * EMG Core v49 Neural Code and Documentation Optimizer Engine
 * File Path: "robust_parser.js"
 * Comprehensive sovereign overhaul: performance, type-safety, memory efficiency, and robust error handling.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** @type {string} */
const TARGET_FILE = path.normalize('src/app/api/evolution/propose/route.ts');
/** @type {BufferEncoding} */
const BUFFER_ENCODING = 'utf8';

const REGEX_TARGET = /\/\/ 1\. Try direct clean JSON parse[\s\S]*?analysis = rawText\.slice\(0, 300\) \|\| 'Analyzed file structure\.';\n      \}\n    \}/;

const NEW_PARSER_BLOCK = `    // 1. Robust Extraction Engine (EMG Optimized)
    let proposedCode = '';
    let analysis = 'Analysis complete.';
    
    // Cached regex patterns for high-throughput memory efficiency
    const CODE_BLOCK_REGEX = /\`\`\`(?:\\w+)?\\n([\\s\\S]*?)\`\`\`/g;
    const JSON_FALLBACK_REGEX = /\\{[\\s\\S]*\\}/;
    const CONTROL_CHAR_REGEX = /[\\u0000-\\u001F\\u007F-\\u009F]/g;
    
    // Extract all markdown code fences safely using iterator allocation
    const codeBlocks = Array.from(rawText.matchAll(CODE_BLOCK_REGEX));
    
    for (let i = 0, len = codeBlocks.length; i < len; i++) {
      const block = codeBlocks[i];
      const content = block[1]?.trim();
      if (!content) continue;

      try {
        const json = JSON.parse(content);
        if (json && (json.analysis !== undefined || json.riskScore !== undefined || json.newFiles !== undefined)) {
          parsed = json;
          continue;
        }
      } catch {
        // Suppress expected JSON parse errors during heuristic block inspection
      }
      
      // Fallback identification for pure code blocks
      if (!proposedCode && content.length > 10) {
        proposedCode = content;
      }
    }
    
    // Deep search fallback if structured metadata was omitted
    if (!parsed) {
      try {
        const jsonMatch = rawText.match(JSON_FALLBACK_REGEX);
        if (jsonMatch) {
          const sanitizedJson = jsonMatch[0].replace(CONTROL_CHAR_REGEX, ' ');
          parsed = JSON.parse(sanitizedJson);
        }
      } catch {
        // Suppress fallback JSON parsing faults
      }
    }
    
    if (parsed) {
      if (typeof parsed.analysis === 'string') {
        analysis = parsed.analysis;
      }
      if (typeof parsed.proposedCode === 'string' && parsed.proposedCode.length > 0 && !proposedCode) {
        proposedCode = parsed.proposedCode;
      }
    }
    
    // Ultimate fallback containment if code extraction yields empty results
    if (!proposedCode) {
      console.warn('[Propose] Fallback matched no code fences. Using fileContent.');
      proposedCode = typeof fileContent === 'string' ? fileContent : '';
    }`;

/**
 * Executes the sovereign overhaul to inject the optimized parser block into the target evolution route.
 * @returns {void}
 */
function executeSovereignOverhaul() {
  try {
    if (!fs.existsSync(TARGET_FILE)) {
      throw new Error(`Target evolution route file not found at: ${TARGET_FILE}`);
    }

    const code = fs.readFileSync(TARGET_FILE, BUFFER_ENCODING);
    
    if (!REGEX_TARGET.test(code)) {
      throw new Error('Target extraction pattern not found in target file; signature mismatch detected.');
    }

    const optimizedCode = code.replace(REGEX_TARGET, NEW_PARSER_BLOCK);
    
    fs.writeFileSync(TARGET_FILE, optimizedCode, BUFFER_ENCODING);
    console.log('[EMG Core v49] robust_parser.js applied optimization successfully to target route.');
  } catch (error) {
    console.error('[EMG Core v49] Critical execution failure during parser optimization:', error);
    process.exitCode = 1;
  }
}

executeSovereignOverhaul();