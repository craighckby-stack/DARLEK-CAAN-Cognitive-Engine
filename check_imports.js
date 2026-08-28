/**
 * @file check_imports.js
 * @description Comprehensive optimized script to audit project imports against package.json dependencies.
 * @version 4.9.0-SOVEREIGN
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
const VALID_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.vue', '.svelte']);

/**
 * Set of built-in Node.js module specifiers for quick lookup.
 * @type {ReadonlySet<string>}
 */
const NODE_BUILTINS = new Set([
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
  'fs', 'path', 'crypto', 'http', 'url', 'stream', 'util', 'os', 'events', 'buffer', 'child_process', 'cluster', 'dgram', 'dns', 'domain', 'net', 'tls', 'zlib'
]);

/**
 * Regular expression pattern to capture import/require/export specifiers.
 * @type {RegExp}
 */
const IMPORT_SPECIFIER_REGEX = /(?:from\s+|import\s*\(?\s*|require\s*\(\s*)['"]([^'"]+)['"]/g;

/**
 * Iteratively yields source file paths under a directory.
 * @param {string} dirPath - Root directory to start traversal.
 * @returns {Generator<string, void, unknown>}
 */
function* walkDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  /** @type {string[]} */
  const stack = [dirPath];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    if (!currentDir) continue;

    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== 'build' && !entry.name.startsWith('.')) {
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
      // Ignore inaccessible directories gracefully
    }
  }
}

/**
 * Normalizes import specifier to its primary package dependency name.
 * @param {string} rawSpecifier - The raw import specifier string.
 * @returns {string | null} Normalized package name or null if relative/aliased/builtin.
 */
function normalizePackageName(rawSpecifier) {
  if (!rawSpecifier) return null;

  let specifier = rawSpecifier.trim();

  if (specifier.startsWith('node:')) {
    specifier = specifier.slice(5);
  }

  if (specifier.startsWith('.') || specifier.startsWith('@/')) {
    return null;
  }

  const parts = specifier.split('/');
  if (parts[0].startsWith('@') && parts.length > 1) {
    return `${parts[0]}/${parts[1]}`;
  }

  return parts[0] || null;
}

/**
 * Audits project files against defined dependencies in package.json.
 * @returns {void}
 */
function auditImports() {
  /** @type {Record<string, any>} */
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

  /** @type {Set<string>} */
  const deps = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {})
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
        const rawSpecifier = match[1];
        const pkgName = normalizePackageName(rawSpecifier);

        if (pkgName) {
          detectedImports.add(pkgName);
        }
      }
    } catch {
      // Ignore unreadable source files gracefully
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