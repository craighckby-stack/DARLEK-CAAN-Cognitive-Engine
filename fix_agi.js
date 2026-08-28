/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fix_agi.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

function executeSovereignOverhaul() {
    const targetPath = path.resolve('src/utils/agi-engine.ts');

    try {
        if (!fs.existsSync(targetPath)) {
            throw new Error(`Critical target path not found: ${targetPath}`);
        }

        const code = fs.readFileSync(targetPath, 'utf8');
        const classRegex = /\/\/ 9\.5 Edge Governance.*?export class EdgeGovernanceGatekeeper \{.*?\}\s*\}/gs;
        const matches = code.match(classRegex);

        if (matches && matches.length > 1) {
            const optimizedCode = code.replace(matches[1], '');
            fs.writeFileSync(targetPath, optimizedCode, 'utf8');
        }
    } catch (error) {
        process.stderr.write(`[EMG Core v49 Execution Error]: ${error.message}\n`);
        process.exitCode = 1;
    }
}

executeSovereignOverhaul();