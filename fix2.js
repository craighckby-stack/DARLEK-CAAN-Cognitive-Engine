const fs = require('fs');
let code = fs.readFileSync('src/app/api/evolution/propose/route.ts', 'utf8');
code = code.replace(/```json/g, "\\`\\`\\`json");
code = code.replace(/```tsx/g, "\\`\\`\\`tsx");
code = code.replace(/}\n```/g, "}\n\\`\\`\\`");
code = code.replace(/TRUNCATIONS\n```/g, "TRUNCATIONS\n\\`\\`\\`");
fs.writeFileSync('src/app/api/evolution/propose/route.ts', code);
