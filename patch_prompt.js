const fs = require('fs');
const file = 'src/app/api/evolution/propose/route.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '1. MAXIMIZE USE OF THE "newFiles" ARRAY FOR DELEGATION & GENERATE MISSING FILES (CRITICAL):',
  '1. GENERATE ALL MISSING INTERCEPTED FILES AND LENGTHEN ENHANCEMENTS (EXTREMELY CRITICAL):'
);

code = code.replace(
  /If the active file contains ANY missing or intercepted imports \(files missing from the current repo tree\), or if you enhance the code with new external logic, you MUST generate the full source code for those missing files and place them in the "newFiles" array\./g,
  'You MUST cross-reference all imports in the active file against the EXISTING REPOSITORY FILES context. If the file contains ANY missing or intercepted imports (files missing from the current repo tree), or if you enhance the code with new external logic, you MUST generate the full, exhaustive source code for EVERY SINGLE ONE of those missing files and place them in the "newFiles" array. Do not miss any.'
);

code = code.replace(
  /SIGNIFICANTLY LENGTHEN ENHANCEMENTS: Provide deep, comprehensive, and exhaustive enhancements rather than small tweaks\. Expand the logic thoroughly and implement sophisticated capabilities without abbreviating\./g,
  'SIGNIFICANTLY LENGTHEN ENHANCEMENTS: You MUST provide deep, comprehensive, and exhaustive enhancements rather than small tweaks. Expand the logic thoroughly, write extensive implementations, and implement sophisticated capabilities. Do not artificially abbreviate or shorten the code. The length of the enhancement must be substantial.'
);

fs.writeFileSync(file, code);
