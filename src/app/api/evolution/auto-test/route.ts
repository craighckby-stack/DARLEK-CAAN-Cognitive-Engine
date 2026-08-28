import { NextRequest, NextResponse } from 'next/server';
import { mainWorker } from '@/lib/main-worker';
import { runAstDiffGate } from '@/lib/ast-diff-gate';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

// ── AUTO-TEST RUNNER ──────────────────────────────────────────────
// After a mutation is applied, this endpoint runs automated checks:
//   1. TypeScript compilation check on the mutated file
//   2. Import dependency verification
//   3. Export surface validation
//   4. Common anti-pattern detection
// Returns a structured report that feeds into the Coherence Gate.
// ───────────────────────────────────────────────────────────────────

export interface AutoTestResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AutoTestResponse {
  success: boolean;
  results: AutoTestResult[];
  verdict: 'PASSED' | 'WARNING_PASSED' | 'REJECTED' | 'ERROR';
  total: number;
  passed: number;
  failed: number;
  warned: number;
  error?: string;
}

function runTypeScriptSyntaxCheck(code: string, _filePath: string): AutoTestResult[] {
  const results: AutoTestResult[] = [];

  // Check for basic syntax issues via pattern matching
  // (Full TSC would require exec which is container-restricted)

  // Unmatched braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    results.push({
      category: 'SYNTAX',
      test: 'Brace matching',
      status: 'fail',
      message: `Mismatched braces: ${openBraces} open vs ${closeBraces} close`,
      severity: 'high',
    });
  }

  // Unmatched parentheses
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    results.push({
      category: 'SYNTAX',
      test: 'Parenthesis matching',
      status: 'fail',
      message: `Mismatched parentheses: ${openParens} open vs ${closeParens} close`,
      severity: 'high',
    });
  }

  // Unmatched brackets
  const openBrackets = (code.match(/\[/g) || []).length;
  const closeBrackets = (code.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    results.push({
      category: 'SYNTAX',
      test: 'Bracket matching',
      status: 'fail',
      message: `Mismatched brackets: ${openBrackets} open vs ${closeBrackets} close`,
      severity: 'high',
    });
  }

  if (results.length === 0) {
    results.push({
      category: 'SYNTAX',
      test: 'Bracket/brace matching',
      status: 'pass',
      message: 'All brackets, braces, and parentheses are balanced',
      severity: 'high',
    });
  }

  return results;
}

function runImportValidation(code: string, filePath: string): AutoTestResult[] {
  const results: AutoTestResult[] = [];
  const imports = [...code.matchAll(/import\s+.*?from\s+['"](.+?)['"]/g)].map(m => m[1]);

  // Check for relative imports that might break
  const relativeImports = imports.filter(i => i.startsWith('.'));
  const depth = filePath.split('/').length;
  const excessiveDepth = relativeImports.filter(i => {
    const upLevels = (i.match(/\.\.\//g) || []).length;
    return upLevels > depth - 1;
  });

  if (excessiveDepth.length > 0) {
    results.push({
      category: 'IMPORTS',
      test: 'Relative import depth',
      status: 'fail',
      message: `Import paths go beyond root: ${excessiveDepth.join(', ')}`,
      severity: 'high',
    });
  }

  // Check for @/ alias usage consistency
  const hasAtImports = imports.some(i => i.startsWith('@/'));
  const hasRelative = relativeImports.length > 0;
  if (hasAtImports && hasRelative) {
    results.push({
      category: 'IMPORTS',
      test: 'Import style consistency',
      status: 'warn',
      message: 'Mixed import styles: both @/ aliases and relative paths used',
      severity: 'low',
    });
  }

  // Check for Node.js built-in imports
  const nodeImports = imports.filter(i => ['fs', 'path', 'os', 'crypto', 'util', 'stream', 'http', 'https'].includes(i));
  if (nodeImports.length > 0 && !filePath.includes('api/')) {
    results.push({
      category: 'IMPORTS',
      test: 'Server-only imports in client code',
      status: 'warn',
      message: `Node.js module(s) imported: ${nodeImports.join(', ')}. Ensure this file is server-only.`,
      severity: 'medium',
    });
  }

  if (results.length === 0) {
    results.push({
      category: 'IMPORTS',
      test: 'Import validation',
      status: 'pass',
      message: `All ${imports.length} imports look valid`,
      severity: 'medium',
    });
  }

  return results;
}

function runExportValidation(code: string, filePath: string): AutoTestResult[] {
  const results: AutoTestResult[] = [];
  const exports = [...code.matchAll(/export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+(\w+)/g)].map(m => m[1]);

  if (exports.length === 0) {
    // Check if it's a page/route file that needs a default export
    if (filePath.includes('page.tsx') || filePath.includes('route.ts') || filePath.includes('layout.tsx')) {
      results.push({
        category: 'EXPORTS',
        test: 'Required default export',
        status: 'fail',
        message: `${filePath} requires a default export (page, layout, or route handler)`,
        severity: 'high',
      });
    }
  }

  // Check for duplicate exports
  const exportNames = exports.map(e => e.toLowerCase());
  const duplicates = exportNames.filter((name, idx) => exportNames.indexOf(name) !== idx);
  if (duplicates.length > 0) {
    results.push({
      category: 'EXPORTS',
      test: 'Duplicate export detection',
      status: 'fail',
      message: `Duplicate export(s): ${[...new Set(duplicates)].join(', ')}`,
      severity: 'high',
    });
  }

  // Check for 'export default' in route files (API routes need named exports)
  if (filePath.includes('api/') && filePath.includes('route.ts')) {
    const hasDefaultExport = /export\s+default\s+/.test(code);
    const hasNamedExportGET = /export\s+(?:async\s+)?function\s+GET\b/.test(code) || /export\s+(?:async\s+)?const\s+GET\b/.test(code);
    const hasNamedExportPOST = /export\s+(?:async\s+)?function\s+POST\b/.test(code) || /export\s+(?:async\s+)?const\s+POST\b/.test(code);

    if (hasDefaultExport && !hasNamedExportGET && !hasNamedExportPOST) {
      results.push({
        category: 'EXPORTS',
        test: 'API route export format',
        status: 'warn',
        message: 'Route handler uses default export. Next.js App Router expects named exports (GET, POST, etc.)',
        severity: 'high',
      });
    }
  }

  if (results.length === 0) {
    results.push({
      category: 'EXPORTS',
      test: 'Export validation',
      status: 'pass',
      message: `Found ${exports.length} export(s). No issues detected.`,
      severity: 'medium',
    });
  }

  return results;
}

function runAntiPatternCheck(code: string, _originalCode: string, filePath: string): AutoTestResult[] {
  const results: AutoTestResult[] = [];

  // Check for dangerous eval usage
  if (/\beval\s*\(/.test(code)) {
    results.push({
      category: 'SECURITY',
      test: 'eval() detection',
      status: 'fail',
      message: 'eval() found in code. This is a security risk and performance issue.',
      severity: 'high',
    });
  }

  // Check for innerHTML assignment
  if (/\.innerHTML\s*=/.test(code)) {
    results.push({
      category: 'SECURITY',
      test: 'innerHTML XSS risk',
      status: 'warn',
      message: 'innerHTML assignment detected. Potential XSS vulnerability.',
      severity: 'medium',
    });
  }

  // Check for hardcoded secrets
  const secretPatterns = [
    /api[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/gi,
    /password\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    /token\s*[:=]\s*['"][^'"]{20,}['"]/gi,
    /secret\s*[:=]\s*['"][^'"]{8,}['"]/gi,
  ];
  for (const pattern of secretPatterns) {
    const matches = [...code.matchAll(pattern)];
    if (matches.length > 0) {
      // Skip if it's a type definition or interface
      const realSecrets = matches.filter(m => {
        const index = m.index ?? 0;
        const lineStart = code.lastIndexOf('\n', index) + 1;
        const line = code.slice(lineStart, index + m[0].length);
        return !line.includes('interface') && !line.includes('type ') && !line.includes('placeholder') && !line.includes('TODO');
      });
      if (realSecrets.length > 0) {
        results.push({
          category: 'SECURITY',
          test: 'Hardcoded secret detection',
          status: 'fail',
          message: `Potential hardcoded secret found near: ${realSecrets[0][0].slice(0, 40)}...`,
          severity: 'high',
        });
      }
    }
  }

  // Check for empty catch blocks
  const emptyCatches = [...code.matchAll(/catch\s*\([^)]*\)\s*\{\s*\}/g)];
  if (emptyCatches.length > 0) {
    results.push({
      category: 'ERROR_HANDLING',
      test: 'Empty catch blocks',
      status: 'warn',
      message: `${emptyCatches.length} empty catch block(s) found. Errors will be silently swallowed.`,
      severity: 'medium',
    });
  }

  // Check for async functions without try/catch
  const asyncFunctions = [...code.matchAll(/async\s+(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?)\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g)];
  const tryBlocks = [...code.matchAll(/try\s*\{/g)].length;
  if (asyncFunctions.length > 0 && tryBlocks === 0) {
    results.push({
      category: 'ERROR_HANDLING',
      test: 'Async error handling',
      status: 'warn',
      message: `${asyncFunctions.length} async function(s) without try/catch. Unhandled promise rejections possible.`,
      severity: 'medium',
    });
  }

  // Check for React Hook rules violations (simplified)
  if (filePath.endsWith('.tsx')) {
    const useStateCalls = [...code.matchAll(/useState\s*</g)].length;
    const useEffectCalls = [...code.matchAll(/useEffect\s*\(/g)].length;
    const useCallbackCalls = [...code.matchAll(/useCallback\s*\(/g)].length;
    const useRefCalls = [...code.matchAll(/useRef\s*</g)].length;
    const hookCount = useStateCalls + useEffectCalls + useCallbackCalls + useRefCalls;

    if (hookCount > 0) {
      // Check hooks are inside a function component or custom hook
      const functionComponent = code.match(/(?:function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:\([^)]*\)|[^\s=]*)\s*(?::\s*[^{]+)?\s*=>\s*\{)/g);
      if (functionComponent || code.includes('function ')) {
        // Simple heuristic: check if hooks appear at top level (not nested in conditions)
        const hasConditionalHook = /\b(if\s*\(|\?\s*.*\?:|\|\|).*useState|useEffect|useCallback|useRef/.test(code);
        if (hasConditionalHook) {
          results.push({
            category: 'REACT',
            test: 'React Hook rules',
            status: 'warn',
            message: 'Possible conditional hook call detected. Hooks must be called unconditionally.',
            severity: 'medium',
          });
        }
      }
    }
  }

  // Check for memory leaks (setInterval without clearInterval, addEventListener without remove)
  const setIntervals = [...code.matchAll(/setInterval\s*\(/g)].length;
  const clearIntervals = [...code.matchAll(/clearInterval\s*\(/g)].length;
  if (setIntervals > clearIntervals) {
    results.push({
      category: 'PERFORMANCE',
      test: 'Interval cleanup',
      status: 'warn',
      message: `${setIntervals - clearIntervals} setInterval(s) without matching clearInterval. Potential memory leak.`,
      severity: 'low',
    });
  }

  const addEventListeners = [...code.matchAll(/\.addEventListener\s*\(/g)].length;
  const removeEventListeners = [...code.matchAll(/\.removeEventListener\s*\(/g)].length;
  if (addEventListeners > removeEventListeners) {
    results.push({
      category: 'PERFORMANCE',
      test: 'Event listener cleanup',
      status: 'warn',
      message: `${addEventListeners - removeEventListeners} addEventListener(s) without matching removeEventListener. Potential memory leak.`,
      severity: 'low',
    });
  }

  if (results.length === 0) {
    results.push({
      category: 'QUALITY',
      test: 'Anti-pattern scan',
      status: 'pass',
      message: 'No anti-patterns detected',
      severity: 'medium',
    });
  }

  return results;
}

function runDiffSanityCheck(code: string, originalCode: string, _filePath: string): AutoTestResult[] {
  const results: AutoTestResult[] = [];

  // Check if the file got completely wiped
  if (code.trim().length < 10 && originalCode.trim().length > 50) {
    results.push({
      category: 'DIFF',
      test: 'Content integrity',
      status: 'fail',
      message: 'File appears to have been nearly emptied. Original had significant content.',
      severity: 'high',
    });
  }

  // Check for massive expansion (>300%)
  const sizeRatio = code.length / Math.max(1, originalCode.length);
  if (sizeRatio > 3) {
    results.push({
      category: 'DIFF',
      test: 'Size expansion check',
      status: 'warn',
      message: `File expanded by ${Math.round((sizeRatio - 1) * 100)}%. Verify this is intentional.`,
      severity: 'low',
    });
  }

  return results;
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'online', service: 'EVOLUTION_AUTO_TEST_API' });
}

export async function POST(req: NextRequest): Promise<NextResponse<AutoTestResponse>> {
  try {
    const body = await safeReqJson(req, {});
    const originalCode = typeof body.originalCode === 'string' ? body.originalCode : '';
    const proposedCode = typeof body.proposedCode === 'string' ? body.proposedCode : '';
    const filePath = typeof body.filePath === 'string' ? body.filePath : '';
    const repoFiles = Array.isArray(body.repoFiles) ? body.repoFiles : [];
    const newFiles = Array.isArray(body.newFiles) ? body.newFiles : [];

    const results: AutoTestResult[] = [];

    // 0. Zero-LLM Deterministic Structural Sanity Guard & AST Diff Gate
    const sanityCheck = await mainWorker.validateSanity(originalCode, proposedCode, filePath, repoFiles, newFiles);
    for (const v of sanityCheck.violations) {
      results.push({
        category: 'STRUCTURAL_SANITY',
        test: v.test,
        status: v.severity === 'high' ? 'fail' : 'warn',
        message: v.message,
        severity: v.severity,
      });
    }

    // Explicit AST Diff Gate Validation
    const astGate = runAstDiffGate(originalCode, proposedCode, filePath);
    if (astGate.passed) {
      results.push({
        category: 'AST_DIFF_GATE',
        test: 'AST Symbol & Drift Verification',
        status: 'pass',
        message: `AST Symbol Map intact (${astGate.symbolMap.retainedCount}/${astGate.symbolMap.originalCount} retained). Drift ratio: ${(astGate.structuralDriftRatio * 100).toFixed(1)}%.`,
        severity: 'high',
      });
    } else {
      for (const v of astGate.violations) {
        results.push({
          category: 'AST_DIFF_GATE',
          test: `AST Gate (${v.code})`,
          status: v.severity === 'high' ? 'fail' : 'warn',
          message: v.message,
          severity: v.severity,
        });
      }
    }

    // Run remaining syntax & static checks
    results.push(...runTypeScriptSyntaxCheck(proposedCode, filePath));
    results.push(...runImportValidation(proposedCode, filePath));
    results.push(...runExportValidation(proposedCode, filePath));
    results.push(...runAntiPatternCheck(proposedCode, originalCode, filePath));
    results.push(...runDiffSanityCheck(proposedCode, originalCode, filePath));

    const total = results.length;
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warned = results.filter(r => r.status === 'warn').length;

    const hasHighFail = results.some(r => r.status === 'fail' && r.severity === 'high');
    const verdict = hasHighFail ? 'REJECTED' : failed > 0 ? 'WARNING_PASSED' : 'PASSED';

    return NextResponse.json({
      success: true,
      results,
      verdict,
      total,
      passed,
      failed,
      warned
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'AutoTest compilation failed';
    console.error('AutoTest API error:', error);
    return NextResponse.json({
      success: false,
      error: errMessage,
      results: [],
      verdict: 'ERROR',
      total: 0,
      passed: 0,
      failed: 0,
      warned: 0
    }, { status: 200 });
  }
}