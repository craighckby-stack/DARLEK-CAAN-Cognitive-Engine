/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fix_agi.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

const fs = require('fs');
let code = fs.readFileSync('src/utils/agi-engine.ts', 'utf8');
const classRegex = /\/\/ 9\.5 Edge Governance.*?export class EdgeGovernanceGatekeeper \{.*?\}\s*\}/gs;
const matches = code.match(classRegex);
if (matches && matches.length > 1) {
    code = code.replace(matches[1], ''); // Remove the second one
}
fs.writeFileSync('src/utils/agi-engine.ts', code);
