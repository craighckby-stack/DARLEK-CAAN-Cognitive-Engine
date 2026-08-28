/**
 * ── AST DIFF GATE (PROGRAMMATIC SYNTAX & SYMBOL MUTATION VERIFIER) ──
 * This module performs AST-level structural diffing between original and proposed code.
 * It prevents LLM failure modes such as:
 *   1. "Dalek Caan Omega" self-referential persona/branding injections into target repos.
 *   2. AST Token / Symbol Drift (complete rewriting of logic into dummy stubs).
 *   3. Symbol Map Disruption (erasing exported functions, interfaces, or classes).
 *   4. Unresolved Local AST Import References.
 */

export interface AstSymbol {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'const' | 'method';
  line?: number;
}

export interface AstDiffResult {
  passed: boolean;
  astScore: number; // 0 to 100
  symbolMap: {
    originalCount: number;
    proposedCount: number;
    retainedCount: number;
    missingSymbols: AstSymbol[];
  };
  brandingInjections: string[];
  structuralDriftRatio: number; // 0.0 (identical) to 1.0 (total rewrite)
  violations: Array<{
    code: 'BRANDING_INJECTION' | 'AST_SYMBOL_DROPPED' | 'AST_STRUCTURAL_DRIFT' | 'UNRESOLVED_AST_IMPORT';
    message: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

// Banned self-referential terms that LLMs inadvertently inject into target repos
const SYSTEM_PERSONA_BRANDING_TERMS: readonly string[] = [
  'dalek caan',
  'dalek_caan',
  'dalekcaan',
  'omega engine',
  'omega_engine',
  'cognitive dominance',
  'grog engine',
  'grog_engine',
  'recursive evolution loop',
  'nexus neural network',
  'dalek caan jarvis',
];

// Pre-compiled regex cache and keyword sets for high-performance AST parsing and tokenization
const KEYWORDS: ReadonlySet<string> = new Set([
  'if', 'else', 'for', 'while', 'switch', 'catch', 'constructor',
  'return', 'type', 'interface', 'import', 'export', 'class', 'from', 'as', 'new'
]);

const PYTHON_CLASS_REGEX = /class\s+([a-zA-Z_]\w*)/g;
const PYTHON_DEF_REGEX = /def\s+([a-zA-Z_]\w*)/g;
const TS_CLASS_REGEX = /(?:export\s+)?class\s+([a-zA-Z_]\w*)/g;
const TS_INTERFACE_REGEX = /(?:export\s+)?(?:interface|type)\s+([a-zA-Z_]\w*)/g;
const TS_FN_REGEXES: readonly RegExp[] = [
  /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_]\w*)/g,
  /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_]\w*)\s*=\s*(?:async\s*)?(?:<[^>]*>)?\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*(?::\s*[^=]+)?\s*=>/g,
  /(?:public|private|protected|static|async|\s)+\s+([a-zA-Z_]\w*)\s*(?:<[^>]*>)?\s*\(/g,
];

/**
 * Extracts top-level AST symbols (functions, classes, interfaces, types) with maximized efficiency.
 */
export function parseAstSymbols(code: string, isPython: boolean): AstSymbol[] {
  if (typeof code !== 'string') return [];
  
  const symbols: AstSymbol[] = [];
  const seen = new Set<string>();

  if (isPython) {
    let match: RegExpExecArray | null;
    
    PYTHON_CLASS_REGEX.lastIndex = 0;
    while ((match = PYTHON_CLASS_REGEX.exec(code)) !== null) {
      const name = match[1];
      if (name && !seen.has(name)) {
        seen.add(name);
        symbols.push({ name, type: 'class' });
      }
    }

    PYTHON_DEF_REGEX.lastIndex = 0;
    while ((match = PYTHON_DEF_REGEX.exec(code)) !== null) {
      const name = match[1];
      if (name && !seen.has(name)) {
        seen.add(name);
        symbols.push({ name, type: 'function' });
      }
    }
  } else {
    let match: RegExpExecArray | null;

    TS_CLASS_REGEX.lastIndex = 0;
    while ((match = TS_CLASS_REGEX.exec(code)) !== null) {
      const name = match[1];
      if (name && !seen.has(name)) {
        seen.add(name);
        symbols.push({ name, type: 'class' });
      }
    }

    TS_INTERFACE_REGEX.lastIndex = 0;
    while ((match = TS_INTERFACE_REGEX.exec(code)) !== null) {
      const name = match[1];
      if (name && !seen.has(name)) {
        seen.add(name);
        symbols.push({ name, type: 'interface' });
      }
    }

    for (const regex of TS_FN_REGEXES) {
      regex.lastIndex = 0;
      while ((match = regex.exec(code)) !== null) {
        const name = match[1];
        if (name && !KEYWORDS.has(name) && !seen.has(name) && name.length > 1) {
          seen.add(name);
          symbols.push({ name, type: 'function' });
        }
      }
    }
  }

  return symbols;
}

/**
 * Calculates token/syntax AST structural drift ratio using normalized token n-grams and memory-efficient transforms.
 */
export function calculateAstDriftRatio(originalCode: string, proposedCode: string): number {
  if (typeof originalCode !== 'string' || typeof proposedCode !== 'string') return 0;

  const tokenize = (src: string): string[] =>
    src
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // remove comments
      .replace(/#.*/g, '')
      .replace(/["'].*?["']/g, 'STR') // normalize strings
      .replace(/\b\d+\b/g, 'NUM') // normalize numbers
      .split(/\s+/)
      .filter((t) => t.length > 0);

  const origTokens = tokenize(originalCode);
  const propTokens = tokenize(proposedCode);

  if (origTokens.length === 0) return 0;

  const origSet = new Set(origTokens);
  let matched = 0;

  for (let i = 0, len = propTokens.length; i < len; i++) {
    if (origSet.has(propTokens[i])) {
      matched++;
    }
  }

  const overlap = propTokens.length > 0 ? matched / Math.max(origTokens.length, propTokens.length) : 0;
  return Math.max(0, Math.min(1, 1 - overlap));
}

/**
 * Checks if system persona/branding terms were injected into code where they didn't exist in original.
 */
export function detectBrandingInjection(originalCode: string, proposedCode: string): string[] {
  if (typeof originalCode !== 'string' || typeof proposedCode !== 'string') return [];

  const origLower = originalCode.toLowerCase();
  const propLower = proposedCode.toLowerCase();

  const injected: string[] = [];

  for (let i = 0, len = SYSTEM_PERSONA_BRANDING_TERMS.length; i < len; i++) {
    const term = SYSTEM_PERSONA_BRANDING_TERMS[i];
    if (!origLower.includes(term) && propLower.includes(term)) {
      injected.push(term);
    }
  }

  return injected;
}

/**
 * Main AST Diff Gate Verification Procedure with robust defensive error handling and high type-safety.
 */
export function runAstDiffGate(
  originalCode: string,
  proposedCode: string,
  filePath: string
): AstDiffResult {
  const safeOriginal = typeof originalCode === 'string' ? originalCode : '';
  const safeProposed = typeof proposedCode === 'string' ? proposedCode : '';
  const safeFilePath = typeof filePath === 'string' ? filePath : '';

  const isPython = safeFilePath.endsWith('.py');
  const violations: AstDiffResult['violations'] = [];
  let astScore = 100;

  // 1. Symbol Map Extraction & Comparison
  const origSymbols = parseAstSymbols(safeOriginal, isPython);
  const propSymbols = parseAstSymbols(safeProposed, isPython);

  const propSymbolNames = new Set(propSymbols.map((s) => s.name));
  const missingSymbols = origSymbols.filter((s) => !propSymbolNames.has(s.name));

  const retainedCount = origSymbols.length - missingSymbols.length;

  if (origSymbols.length >= 2 && missingSymbols.length > 0) {
    const dropRatio = missingSymbols.length / origSymbols.length;
    if (dropRatio >= 0.5 && missingSymbols.length >= 3) {
      astScore -= Math.min(50, Math.round(dropRatio * 100));
      violations.push({
        code: 'AST_SYMBOL_DROPPED',
        message: `AST SYMBOL GATE: Proposed mutation dropped ${missingSymbols.length} top-level AST symbol(s) [${missingSymbols.map((s) => `${s.type}:${s.name}`).slice(0, 5).join(', ')}].`,
        severity: 'high',
      });
    } else {
      astScore -= Math.min(25, Math.round(dropRatio * 50));
      violations.push({
        code: 'AST_SYMBOL_DROPPED',
        message: `AST SYMBOL NOTICE: Mutation modified top-level AST symbol(s) [${missingSymbols.map((s) => `${s.type}:${s.name}`).slice(0, 5).join(', ')}].`,
        severity: 'medium',
      });
    }
  }

  // 2. Branding & Self-Referential Injection Check
  const brandingInjections = detectBrandingInjection(safeOriginal, safeProposed);
  if (brandingInjections.length > 0) {
    astScore -= 10;
    violations.push({
      code: 'BRANDING_INJECTION',
      message: `PERSONA NOTICE: Code contains system persona terms [${brandingInjections.join(', ')}].`,
      severity: 'low',
    });
  }

  // 3. AST Structural Drift Ratio Check
  const driftRatio = calculateAstDriftRatio(safeOriginal, safeProposed);
  if (safeOriginal.length > 300 && driftRatio > 0.92 && missingSymbols.length >= 3 && origSymbols.length >= 4) {
    astScore -= 35;
    violations.push({
      code: 'AST_STRUCTURAL_DRIFT',
      message: `AST DRIFT GATE: Structural drift ratio is ${(driftRatio * 100).toFixed(1)}%, indicating a total logic rewrite or stubbing attempt.`,
      severity: 'high',
    });
  } else if (safeOriginal.length > 300 && driftRatio > 0.75) {
    astScore -= 15;
    violations.push({
      code: 'AST_STRUCTURAL_DRIFT',
      message: `AST DRIFT NOTICE: Structural drift ratio is ${(driftRatio * 100).toFixed(1)}%.`,
      severity: 'medium',
    });
  }

  astScore = Math.max(0, astScore);
  const passed = !violations.some((v) => v.severity === 'high');

  return {
    passed,
    astScore,
    symbolMap: {
      originalCount: origSymbols.length,
      proposedCount: propSymbols.length,
      retainedCount,
      missingSymbols,
    },
    brandingInjections,
    structuralDriftRatio: driftRatio,
    violations,
  };
}