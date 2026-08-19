/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fix_propose.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

const fs = require('fs');
let code = fs.readFileSync('src/app/api/evolution/propose/route.ts', 'utf8');
code = code.replace(/```json/g, "\\`\\`\\`json");
code = code.replace(/```tsx/g, "\\`\\`\\`tsx");
code = code.replace(/}\n```\n/g, "}\n\\`\\`\\`\n");
code = code.replace(/\n```\nRisk/g, "\n\\`\\`\\`\nRisk");
fs.writeFileSync('src/app/api/evolution/propose/route.ts', code);
