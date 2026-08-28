/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fix2.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Target path relative to the process execution root directory.
 * @type {string}
 */
const TARGET_FILE_PATH = 'src/app/api/evolution/propose/route.ts';

/**
 * Normalizes code content by escaping triple backtick code fences.
 * @param {string} content - Raw source code string.
 * @returns {string} Sanitized source code string.
 */
function sanitizeFences(content) {
  return content
    .replace(/```json/g, '\\`\\`\\`json')
    .replace(/```tsx/g, '\\`\\`\\`tsx')
    .replace(/}\n```/g, '}\n\\`\\`\\`')
    .replace(/TRUNCATIONS\n```/g, 'TRUNCATIONS\n\\`\\`\\`');
}

/**
 * Core execution routine for route file sanitization cycles.
 * Reads, sanitizes, and writes target route files back to disk conditionally.
 * @param {string} relativePath - Path to target file.
 * @returns {boolean} True if file was modified and updated; false otherwise.
 */
function processRouteFile(relativePath) {
  const absolutePath = path.resolve(process.cwd(), relativePath);

  try {
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Target file not found at path: ${absolutePath}`);
    }

    const originalCode = fs.readFileSync(absolutePath, 'utf8');
    const sanitizedCode = sanitizeFences(originalCode);

    // Skip unnecessary disk I/O operations if code is unchanged
    if (sanitizedCode === originalCode) {
      return false;
    }

    fs.writeFileSync(absolutePath, sanitizedCode, 'utf8');
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[EMG Core] Failed to process route file (${relativePath}): ${message}`);
    throw error;
  }
}

// Execute sovereign evolution cycle step
processRouteFile(TARGET_FILE_PATH);