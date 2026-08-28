/**
 * @file check_imports.js
 * @description Comprehensive optimized script to audit project imports against package.json dependencies.
 * @version 4.9.1-SOVEREIGN-OPTIMIZED
 */

// @ts-check
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { builtinModules } = require('node:module');

/**
 * Valid file extensions to scan for module import/require specifiers.
 * @type {ReadonlySet<string>}
 */
const VALID_EXTENSIONS = Object.freeze(new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.vue', '.svelte']));

/**
 * Set of built-in Node.js module specifiers for quick lookup.
 * @type {ReadonlySet<string>}
 */
const NODE_BUILTINS = Object.freeze(new Set([
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
  'fs', 'path', 'crypto', 'http', 'url', 'stream', 'util', 'os', 'events', 'buffer', 'child_process', 'cluster', 'dgram', 'dns', 'domain', 'net', 'tls', 'zlib'
]));

/**
 * Regular expression pattern to capture import/require/export specifiers.
 * @type {RegExp}
 */
const IMPORT_SPECIFIER_REGEX = /(?:from\s+|import\s*\(?\s*|require\s*\(\s*)['"]([^'"]+)['"]/g;

/**
 * Iteratively yields source file paths under a directory using safe memory management.
 * @param {string} dirPath - Root directory to start traversal.
 * @returns {Generator<string, void, unknown>}
 */
function* walkDirectory(dirPath) {
  if (!dirPath || typeof dirPath !== 'string' || !fs.existsSync(dirPath)) return;

  /** @type {string[]} */
  const stack = [dirPath];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    if (!currentDir) continue;

    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (let i = 0, len = entries.length; i < len; i++) {
        const entry = entries[i];
        if (!entry) continue;
        
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          const name = entry.name;
          if (name !== 'node_modules' && name !== 'dist' && name !== 'build' && !name.startsWith('.')) {
            stack.push(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (VALID_EXTENSIONS.has(ext)) {
            yield fullPath;
          }
        }
      }
    } catch {
      // Gracefully suppress directory traversal access errors
    }
  }
}

/**
 * Normalizes import specifier to its primary package dependency name.
 * @param {string} rawSpecifier - The raw import specifier string.
 * @returns {string | null} Normalized package name or null if relative/aliased/builtin.
 */
function normalizePackageName(rawSpecifier) {
  if (!rawSpecifier || typeof rawSpecifier !== 'string') return null;

  const specifier = rawSpecifier.trim();
  if (specifier.length === 0) return null;

  const cleanSpecifier = specifier.startsWith('node:') ? specifier.slice(5) : specifier;

  if (cleanSpecifier.startsWith('.') || cleanSpecifier.startsWith('@/')) {
    return null;
  }

  const parts = cleanSpecifier.split('/');
  if (parts.length > 0 && parts[0] && parts[0].startsWith('@') && parts.length > 1 && parts[1]) {
    return `${parts[0]}/${parts[1]}`;
  }

  return (parts.length > 0 && parts[0]) ? parts[0] : null;
}

/**
 * Audits project files against defined dependencies in package.json.
 * @returns {void}
 */
function auditImports() {
  /** @type {Record<string, unknown>} */
  let pkg;

  try {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const content = fs.readFileSync(pkgPath, 'utf8');
    pkg = JSON.parse(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('EMG Core Error: Failed to read or parse package.json -', message);
    process.exit(1);
  }

  const dependencies = (pkg.dependencies && typeof pkg.dependencies === 'object') ? Object.keys(/** @type {Record<string, unknown>} */(pkg.dependencies)) : [];
  const devDependencies = (pkg.devDependencies && typeof pkg.devDependencies === 'object') ? Object.keys(/** @type {Record<string, unknown>} */(pkg.devDependencies)) : [];
  const peerDependencies = (pkg.peerDependencies && typeof pkg.peerDependencies === 'object') ? Object.keys(/** @type {Record<string, unknown>} */(pkg.peerDependencies)) : [];
  const optionalDependencies = (pkg.optionalDependencies && typeof pkg.optionalDependencies === 'object') ? Object.keys(/** @type {Record<string, unknown>} */(pkg.optionalDependencies)) : [];

  /** @type {Set<string>} */
  const deps = new Set([
    ...dependencies,
    ...devDependencies,
    ...peerDependencies,
    ...optionalDependencies
  ]);

  const targetDir = path.resolve(process.cwd(), 'src');
  /** @type {Set<string>} */
  const detectedImports = new Set();

  for (const filePath of walkDirectory(targetDir)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      IMPORT_SPECIFIER_REGEX.lastIndex = 0;

      let match;
      while ((match = IMPORT_SPECIFIER_REGEX.exec(fileContent)) !== null) {
        if (match[1]) {
          const pkgName = normalizePackageName(match[1]);
          if (pkgName) {
            detectedImports.add(pkgName);
          }
        }
      }
    } catch {
      // Gracefully ignore unreadable source files
    }
  }

  let missingCount = 0;

  for (const imp of detectedImports) {
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