/**
 * @file check_imports.js
 * @description Comprehensive optimized script to audit project imports against package.json dependencies.
 * @version 4.9.0-SOVEREIGN
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

const NODE_BUILTINS = new Set(['fs', 'path', 'crypto', 'http', 'url', 'stream', 'util', 'os', 'events']);

function auditImports() {
  let pkg;
  try {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch (error) {
    console.error('EMG Core Error: Failed to read or parse package.json', error.message);
    process.exit(1);
  }

  const deps = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {})
  ]);

  let out = '';
  try {
    out = cp.execSync('grep -r -h "^import" src/', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  } catch (error) {
    // grep returns non-zero exit code if no matches found
    out = '';
  }

  const imports = new Set();
  const lines = out.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    
    const match = line.match(/from\s+['"]([^'"]+)['"]/);
    if (match) {
      let imp = match[1];
      if (!imp.startsWith('.') && !imp.startsWith('@/')) {
        const parts = imp.split('/');
        imp = parts[0].startsWith('@') && parts.length > 1 
          ? `${parts[0]}/${parts[1]}` 
          : parts[0];
        imports.add(imp);
      }
    }
  }

  let missingCount = 0;
  for (const imp of imports) {
    if (imp === 'react' || imp === 'react-dom') continue;
    if (imp.startsWith('next')) continue;
    if (NODE_BUILTINS.has(imp)) continue;
    if (deps.has(imp)) continue;

    console.log(`Missing dependency: ${imp}`);
    missingCount++;
  }

  if (missingCount > 0) {
    process.exitCode = 1;
  }
}

auditImports();