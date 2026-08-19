/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fix_prompt5.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

const fs = require('fs');
const file = 'src/app/api/evolution/propose/route.ts';
let code = fs.readFileSync(file, 'utf8');

const regexToReplace = /\\`\\`\\`tsx\\n\/\/ Complete proposed code for the active file goes here\.\\n\/\/ MUST BE COMPLETE FILE, NO PLACEHOLDERS OR TRUNCATIONS\\n\\`\\`\\`\}``````tsx\/\/ Complete proposed code for the active file goes here\.\/\/ MUST BE COMPLETE FILE, NO PLACEHOLDERS OR TRUNCATIONS```/;
const replacementStr = "\\`\\`\\`\\n`";
code = code.replace(regexToReplace, replacementStr);
fs.writeFileSync(file, code);
