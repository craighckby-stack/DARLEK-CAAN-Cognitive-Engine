const fs = require('fs');
const cp = require('child_process');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.devDependencies || {}));

const out = cp.execSync('grep -r -h "^import" src/').toString();
const imports = new Set();
for (const line of out.split('\n')) {
  const match = line.match(/from\s+['"]([^'"]+)['"]/);
  if (match) {
    let imp = match[1];
    if (!imp.startsWith('.') && !imp.startsWith('@/')) {
      imp = imp.split('/')[0].startsWith('@') ? imp.split('/').slice(0, 2).join('/') : imp.split('/')[0];
      imports.add(imp);
    }
  }
}

for (const imp of imports) {
  if (imp !== 'react' && imp !== 'react-dom' && !deps.includes(imp)) {
    // next modules are in next package
    if (imp.startsWith('next')) continue;
    // node modules
    if (imp === 'fs' || imp === 'path' || imp === 'crypto' || imp === 'http' || imp === 'url') continue;
    
    console.log('Missing dependency:', imp);
  }
}
