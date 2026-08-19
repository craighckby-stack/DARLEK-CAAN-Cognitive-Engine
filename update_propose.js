const fs = require('fs');
const file = 'src/app/api/evolution/propose/route.ts';
let code = fs.readFileSync(file, 'utf8');

const userPromptRegex = /(const userPrompt = `Analyze this file and propose improvements:\\n\$\{rejectionContext\}\\n\$\{appliedMutationsContext\}\\n\$\{userReposContextStr\}\\nACTUAL SIPHONED CODE PATTERNS)/;

code = code.replace(
  userPromptRegex,
  `const repoFilesContext = Array.isArray((body as any)?.repoFiles) 
      ? \`\\nEXISTING REPOSITORY FILES:\\n\${(body as any).repoFiles.slice(0, 1000).join('\\n')}\\n\` 
      : '';\n    $1`
);

code = code.replace(
  /(const userPrompt = `Analyze this file and propose improvements:\\n\$\{rejectionContext\}\\n\$\{appliedMutationsContext\}\\n\$\{userReposContextStr\})/,
  `$1\n\${repoFilesContext}`
);

fs.writeFileSync(file, code);
