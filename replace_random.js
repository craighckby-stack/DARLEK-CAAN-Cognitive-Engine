const fs = require('fs');
let code = fs.readFileSync('src/utils/agi-engine.ts', 'utf8');

// Replace standard random id generation with deterministic counter based ones
code = code.replace(/Math\.random\(\)\.toString\(36\)\.substring\([^)]*\)/g, "Date.now().toString(36)");

// Replace coords with deterministic coords
code = code.replace(/Array\.from\(\{ length: 3 \}, \(\) => Math\.random\(\)\)/g, "[0.42, 0.88, 0.15]");

// Replace random selection
code = code.replace(/safeCandidates\[Math\.floor\(Math\.random\(\) \* safeCandidates\.length\)\]/g, "safeCandidates[0]");

// Replace verificationHash
code = code.replace(/'0x' \+ Math\.random\(\)\.toString\(16\)\.substring\([^)]*\)\.toUpperCase\(\)/g, "'0x' + Date.now().toString(16).toUpperCase()");

fs.writeFileSync('src/utils/agi-engine.ts', code);
