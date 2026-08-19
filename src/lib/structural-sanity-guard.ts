/**
 * ── STRUCTURAL SANITY GUARD (PROGRAMMATIC AST & CODE INTEGRITY CHECK) ──
 * This module provides deterministic, zero-LLM structural validation of code mutations.
 * It prevents "Lazy LLM" maneuvers such as:
 *   1. Scrubbing/deleting existing functions instead of fixing bugs.
 *   2. Hallucinating imports of non-existent files or modules.
 *   3. Wrapping scripts in dummy abstraction classes to dodge fixing logic.
 *   4. Massive code erasure.
 */

import { runAstDiffGate } from './ast-diff-gate';

export interface StructuralSanityViolation {
  category: 'FUNCTION_SCRUB' | 'HALLUCINATED_IMPORT' | 'CLASS_CONVERSION' | 'MASSIVE_ERASURE' | 'AST_DIFF_VIOLATION' | 'BRANDING_INJECTION';
  test: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface StructuralSanityResult {
  passed: boolean;
  score: number; // 0 to 100
  deletedFunctions: string[];
  hallucinatedImports: string[];
  violations: StructuralSanityViolation[];
}

const COMMON_PYTHON_BUILTINS = new Set([
  'os', 'sys', 'math', 'json', 'time', 're', 'random', 'datetime', 'typing',
  'collections', 'itertools', 'functools', 'pathlib', 'logging', 'asyncio',
  'requests', 'numpy', 'pandas', 'pytest', 'unittest', 'flask', 'fastapi',
  'pydantic', 'torch', 'django', 'hashlib', 'sqlite3', 'urllib', 'base64',
  'abc', 'enum', 'dataclasses', 'copy', 'io', 'socket', 'threading', 'multiprocessing'
]);

const COMMON_JS_BUILTINS = new Set([
  'react', 'react-dom', 'next', 'lucide-react', 'motion', 'framer-motion',
  'clsx', 'tailwind-merge', 'zod', 'axios', 'lodash', 'recharts', 'd3',
  'fs', 'path', 'os', 'crypto', 'util', 'stream', 'http', 'https', 'events',
  'buffer', 'url', 'querystring', 'child_process'
]);

/**
 * Programmatically extracts function names from Python or JS/TS code.
 */
export function extractFunctionNames(code: string, isPython: boolean): string[] {
  const functions = new Set<string>();

  if (isPython) {
    // Python def function_name(...)
    const defRegex = /def\s+([a-zA-Z_]\w*)\s*\(/g;
    let match;
    while ((match = defRegex.exec(code)) !== null) {
      const fnName = match[1];
      if (!fnName.startsWith('__') || fnName === '__init__') {
        functions.add(fnName);
      }
    }
  } else {
    // JS/TS function declarations & arrow functions & class methods
    const fnRegexes = [
      /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_]\w*)/g,
      /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_]\w*)\s*=\s*(?:async\s*)?(?:<[^>]*>)?\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*(?::\s*[^=]+)?\s*=>/g,
      /(?:public|private|protected|static|async|\s)+\s+([a-zA-Z_]\w*)\s*(?:<[^>]*>)?\s*\(/g,
    ];

    const reservedKeywords = new Set([
      'if', 'else', 'for', 'while', 'switch', 'catch', 'constructor',
      'return', 'type', 'interface', 'import', 'export', 'class', 'from', 'as', 'new', 'yield', 'await'
    ]);

    for (const regex of fnRegexes) {
      let match;
      while ((match = regex.exec(code)) !== null) {
        const fnName = match[1];
        if (fnName && !reservedKeywords.has(fnName) && fnName.length > 1) {
          functions.add(fnName);
        }
      }
    }
  }

  return Array.from(functions);
}

/**
 * Programmatically extracts local/internal module import paths from code.
 */
export function extractLocalImports(code: string, isPython: boolean): string[] {
  const localImports = new Set<string>();

  if (isPython) {
    // from src.utils.math_engine import ...
    // import src.utils.telemetry_bridge
    // from .relative import ...
    const pythonImportRegexes = [
      /from\s+([a-zA-Z0-9_.]+)\s+import/g,
      /import\s+([a-zA-Z0-9_.]+)/g,
    ];

    for (const regex of pythonImportRegexes) {
      let match;
      while ((match = regex.exec(code)) !== null) {
        const mod = match[1].trim();
        const topMod = mod.split('.')[0];
        // If it starts with local package names like src, lib, app, or relative dot, or is not in builtins
        if (
          mod.startsWith('.') ||
          mod.startsWith('src.') ||
          mod.startsWith('lib.') ||
          mod.startsWith('app.') ||
          (!COMMON_PYTHON_BUILTINS.has(topMod) && (mod.includes('.') || mod.startsWith('src') || mod.startsWith('lib')))
        ) {
          localImports.add(mod);
        }
      }
    }
  } else {
    // JS/TS imports
    const jsImportRegex = /(?:from|import)\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = jsImportRegex.exec(code)) !== null) {
      const impPath = match[1].trim();
      if (
        impPath.startsWith('.') ||
        impPath.startsWith('@/') ||
        impPath.startsWith('src/') ||
        impPath.startsWith('lib/')
      ) {
        localImports.add(impPath);
      }
    }
  }

  return Array.from(localImports);
}

/**
 * Normalizes import path into candidate file paths.
 * e.g., 'src.utils.math_engine' -> ['src/utils/math_engine.py', 'src/utils/math_engine/index.py', 'src/utils/math_engine']
 * e.g., '@/components/Header' -> ['src/components/Header.tsx', 'src/components/Header.ts', 'src/components/Header/index.tsx']
 */
function getCandidateFilePaths(impPath: string, isPython: boolean): string[] {
  const candidates: string[] = [impPath];

  if (isPython) {
    const asPath = impPath.replace(/\./g, '/');
    candidates.push(`${asPath}.py`);
    candidates.push(`${asPath}/__init__.py`);
    candidates.push(asPath);
  } else {
    let clean = impPath;
    if (clean.startsWith('@/')) {
      clean = `src/${clean.slice(2)}`;
    } else if (clean.startsWith('./') || clean.startsWith('../')) {
      clean = clean.replace(/^\.\//, '');
    }

    candidates.push(clean);
    candidates.push(`${clean}.ts`);
    candidates.push(`${clean}.tsx`);
    candidates.push(`${clean}.js`);
    candidates.push(`${clean}.jsx`);
    candidates.push(`${clean}/index.ts`);
    candidates.push(`${clean}/index.tsx`);
  }

  return candidates;
}

/**
 * Deterministic Zero-LLM Structural Sanity Guard.
 */
export function validateStructuralSanity(
  originalCode: string,
  proposedCode: string,
  filePath: string,
  repoFiles: string[] = [],
  newFiles: Array<{ path: string; content?: string }> = []
): StructuralSanityResult {
  const isPython = filePath.endsWith('.py');
  const violations: StructuralSanityViolation[] = [];
  let score = 100;

  // 1. FUNCTION DELETION / SCRUBBING CHECK
  const origFuncs = extractFunctionNames(originalCode, isPython);
  const propFuncs = extractFunctionNames(proposedCode, isPython);
  const deletedFunctions = origFuncs.filter((f) => !propFuncs.includes(f));

  if (origFuncs.length >= 3 && deletedFunctions.length > 0) {
    const scrubRatio = deletedFunctions.length / origFuncs.length;
    // If deleted >= 3 functions AND deleted > 40% of all functions
    if (deletedFunctions.length >= 3 && scrubRatio > 0.4) {
      score -= Math.min(50, Math.round(scrubRatio * 100));
      violations.push({
        category: 'FUNCTION_SCRUB',
        test: 'Function Preservation Guard',
        message: `STRUCTURAL SCRUB: Original file contained ${origFuncs.length} functions, but proposed code deleted ${deletedFunctions.length} function(s) (${deletedFunctions.slice(0, 6).join(', ')}${deletedFunctions.length > 6 ? '...' : ''}).`,
        severity: 'high',
      });
    } else if (deletedFunctions.length > 0) {
      score -= 15;
      violations.push({
        category: 'FUNCTION_SCRUB',
        test: 'Function Preservation Warning',
        message: `Function(s) [${deletedFunctions.join(', ')}] were modified or removed in the proposed mutation.`,
        severity: 'medium',
      });
    }
  }

  // 2. HALLUCINATED IMPORT CHECK
  const localImports = extractLocalImports(proposedCode, isPython);
  const hallucinatedImports: string[] = [];

  // Combine repoFiles + newFiles paths
  const knownFiles = new Set<string>([
    ...repoFiles.map((f) => f.toLowerCase()),
    ...newFiles.map((f) => f.path.toLowerCase()),
    filePath.toLowerCase(),
  ]);

  if (knownFiles.size >= 5) {
    for (const imp of localImports) {
      const candidatePaths = getCandidateFilePaths(imp, isPython);
      const exists = candidatePaths.some((cand) => {
        const lowerCand = cand.toLowerCase();
        return Array.from(knownFiles).some(
          (kf) => kf === lowerCand || kf.endsWith(`/${lowerCand}`) || kf.endsWith(lowerCand) || lowerCand.endsWith(kf)
        );
      });

      if (!exists) {
        hallucinatedImports.push(imp);
      }
    }

    if (hallucinatedImports.length >= 3) {
      score -= hallucinatedImports.length * 20;
      violations.push({
        category: 'HALLUCINATED_IMPORT',
        test: 'Import Target Verification',
        message: `HALLUCINATED IMPORT DETECTED: Proposed code imports module(s) [${hallucinatedImports.join(', ')}] which do NOT exist in the repository or newFiles list.`,
        severity: 'high',
      });
    } else if (hallucinatedImports.length > 0) {
      score -= hallucinatedImports.length * 10;
      violations.push({
        category: 'HALLUCINATED_IMPORT',
        test: 'Import Target Verification',
        message: `Import Target Warning: Module(s) [${hallucinatedImports.join(', ')}] not found in scanned file list.`,
        severity: 'medium',
      });
    }
  }

  // 3. MASSIVE CODE ERASURE CHECK
  if (originalCode.trim().length > 250 && proposedCode.trim().length < originalCode.trim().length * 0.35) {
    score -= 40;
    violations.push({
      category: 'MASSIVE_ERASURE',
      test: 'Code Size & Coverage Check',
      message: `MASSIVE CODE ERASURE: Proposed code is ${Math.round((proposedCode.length / originalCode.length) * 100)}% of original length (${originalCode.length} chars -> ${proposedCode.length} chars). Logic was likely scrubbed.`,
      severity: 'high',
    });
  }

  // 4. CLASS CONVERSION / DUMMY DELEGATION CHECK
  if (isPython) {
    const origClassCount = (originalCode.match(/class\s+/g) || []).length;
    const propClassCount = (proposedCode.match(/class\s+/g) || []).length;
    if (origClassCount === 0 && propClassCount > 0 && deletedFunctions.length >= 3) {
      score -= 30;
      violations.push({
        category: 'CLASS_CONVERSION',
        test: 'Anti-Abstraction Guard',
        message: `CLASS CONVERSION SCRUB: Standalone functions were deleted and wrapped into an abstraction class structure.`,
        severity: 'high',
      });
    }
  }

  // 5. AST DIFF GATE (DETERMINISTIC AST & BRANDING INJECTION CHECK)
  const astDiff = runAstDiffGate(originalCode, proposedCode, filePath);
  for (const astViolation of astDiff.violations) {
    // Avoid duplicating function scrub message if already flagged
    if (astViolation.code === 'AST_SYMBOL_DROPPED' && violations.some((v) => v.category === 'FUNCTION_SCRUB')) {
      continue;
    }

    const cat: StructuralSanityViolation['category'] =
      astViolation.code === 'BRANDING_INJECTION' ? 'BRANDING_INJECTION' : 'AST_DIFF_VIOLATION';

    score -= astViolation.severity === 'high' ? 30 : 15;
    violations.push({
      category: cat,
      test: `AST Diff Gate (${astViolation.code})`,
      message: astViolation.message,
      severity: astViolation.severity,
    });
  }

  score = Math.max(0, score);
  const passed = !violations.some((v) => v.severity === 'high');

  return {
    passed,
    score,
    deletedFunctions,
    hallucinatedImports,
    violations,
  };
}
