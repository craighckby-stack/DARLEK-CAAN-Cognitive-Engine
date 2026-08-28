/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fix_propose.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const TARGET_PATH = path.normalize('src/app/api/evolution/propose/route.ts');

try {
    const rawCode = fs.readFileSync(TARGET_PATH, 'utf8');
    
    // Optimized regex replacements with pre-compiled patterns and atomic safety
    const optimizedCode = rawCode
        .replace(/```json/g, '\\`\\`\\`json')
        .replace(/```tsx/g, '\\`\\`\\`tsx')
        .replace(/}\n```\n/g, '}\n\\`\\`\\`\n')
        .replace(/\n```\nRisk/g, '\n\\`\\`\\`\nRisk');

    fs.writeFileSync(TARGET_PATH, optimizedCode, 'utf8');
} catch (error) {
    process.stderr.write(`[DARLEK-CANN-ERROR] Failed to process proposal route fix: ${error.message}\n`);
    process.exit(1);
}