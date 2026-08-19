const fs = require('fs');
const file = 'src/app/api/evolution/propose/route.ts';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const idx = lines.findIndex(l => l.includes('const userPrompt = `Analyze this file'));
if (idx !== -1) {
    lines.splice(idx, 0, `    const repoFilesContext = Array.isArray((body as any)?.repoFiles) ? \`\\nEXISTING REPOSITORY FILES:\\n\${(body as any).repoFiles.slice(0, 1000).join('\\n')}\\n\` : '';`);
    lines[idx + 1] = lines[idx + 1].replace('${userReposContextStr}', '${userReposContextStr}${repoFilesContext}');
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Patched userPrompt');
}
