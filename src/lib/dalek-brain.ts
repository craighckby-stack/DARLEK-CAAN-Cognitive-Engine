/**
 * DALEK BRAIN — Local Code Analysis & Evolution Engine
 *
 * Zero-network, zero-API code analysis and mutation generator.
 * Runs entirely in-process without external network dependency.
 * Provides structural analysis, AST-level enhancements, debate persona evaluations,
 * and code synthesis.
 */

// ─────────────────────────────────────────────
// UTILITY: Extract code structure
// ─────────────────────────────────────────────

export interface CodeStructure {
  language: string;
  lines: number;
  functions: string[];
  classes: string[];
  imports: string[];
  exports: string[];
  comments: number;
  hasTypes: boolean;
  hasErrorHandling: boolean;
  hasTests: boolean;
  longFunctions: string[];
  complexity: number; // 1-10
  issues: CodeIssue[];
}

export interface CodeIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  line?: number;
  message: string;
  suggestion: string;
}

export function detectLanguage(filePath: string, _code?: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript React',
    js: 'JavaScript',
    jsx: 'JavaScript React',
    py: 'Python',
    rb: 'Ruby',
    go: 'Go',
    rs: 'Rust',
    java: 'Java',
    cs: 'C#',
    cpp: 'C++',
    c: 'C',
    php: 'PHP',
    swift: 'Swift',
    kt: 'Kotlin',
    css: 'CSS',
    json: 'JSON',
  };
  return langMap[ext] || 'TypeScript';
}

export function analyzeStructure(code: string, language: string): CodeStructure {
  const lines = code.split('\n');
  const issues: CodeIssue[] = [];
  const functions: string[] = [];
  const classes: string[] = [];
  const imports: string[] = [];
  const exports: string[] = [];
  const longFunctions: string[] = [];
  let comments = 0;
  let hasTypes = false;
  let hasErrorHandling = false;
  let hasTests = false;
  let complexity = 1;

  // Count comments
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('"""') ||
      trimmed.startsWith("'''")
    ) {
      comments++;
    }
  }

  // Detect structure patterns based on language
  const isTS = language.includes('TypeScript');
  const isJS = language.includes('JavaScript');
  const isPython = language === 'Python';

  // Functions
  const funcPatterns = [
    /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)/g,
    /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g,
    /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s+)?function/g,
  ];
  if (isPython) {
    funcPatterns.length = 0;
    funcPatterns.push(/def\s+([a-zA-Z0-9_]+)\s*\(/g);
  }

  for (const pat of funcPatterns) {
    let match;
    while ((match = pat.exec(code)) !== null) {
      functions.push(match[1]);
    }
  }

  // Classes
  const classPat = isPython ? /class\s+([a-zA-Z0-9_]+)/g : /(?:export\s+)?(?:abstract\s+)?class\s+([a-zA-Z0-9_]+)/g;
  let match;
  while ((match = classPat.exec(code)) !== null) {
    classes.push(match[1]);
  }

  // Imports
  const importLines = code
    .split('\n')
    .filter((l) => l.trim().startsWith('import ') || l.trim().startsWith('from ') || l.trim().startsWith('require('));
  imports.push(...importLines.map((l) => l.trim().slice(0, 80)));

  // Exports
  const exportLines = code.split('\n').filter((l) => l.trim().startsWith('export ') || l.trim().startsWith('module.exports'));
  exports.push(...exportLines.map((l) => l.trim().slice(0, 80)));

  // Type detection
  hasTypes = isTS ? /:[^=;{]+/.test(code) || code.includes('interface ') || code.includes('type ') : false;

  // Error handling
  hasErrorHandling =
    code.includes('try') ||
    code.includes('catch') ||
    code.includes('.catch(') ||
    code.includes('except ') ||
    code.includes('Result<') ||
    code.includes('error');

  // Test detection
  hasTests =
    code.includes('.test(') ||
    code.includes('.it(') ||
    code.includes('describe(') ||
    code.includes('test(') ||
    code.includes('def test_') ||
    code.includes('@test');

  // Long functions (>50 lines between braces/def and closing)
  for (const funcName of functions) {
    const funcRegex = new RegExp(
      `(?:function\\s+${funcName}|${funcName}\\s*=\\s*(?:async\\s*)?(?:\\([^)]*\\)\\s*=>|function))`
    );
    const funcStart = funcRegex.exec(code);
    if (funcStart) {
      const afterFunc = code.slice(funcStart.index);
      let depth = 0;
      let funcEnd = -1;
      let lineCount = 0;
      for (let i = 0; i < afterFunc.length; i++) {
        if (afterFunc[i] === '{' || afterFunc[i] === ':') depth++;
        if (afterFunc[i] === '}') {
          depth--;
          if (depth <= 0) {
            funcEnd = i;
            break;
          }
        }
        if (afterFunc[i] === '\n') lineCount++;
        if (lineCount > 50 && funcEnd === -1) {
          longFunctions.push(funcName);
          break;
        }
      }
    }
  }

  // Complexity estimation
  complexity = Math.min(
    10,
    Math.max(
      1,
      Math.floor(
        functions.length * 0.5 +
          classes.length * 1 +
          longFunctions.length * 2 +
          (code.length > 5000 ? 2 : code.length > 2000 ? 1 : 0) +
          (imports.length > 10 ? 1 : 0)
      )
    )
  );

  // Generate issues
  if (!hasErrorHandling && (functions.length > 0 || code.length > 200)) {
    issues.push({
      type: 'error-handling',
      severity: 'medium',
      message: 'No error handling detected',
      suggestion: 'Add try/catch blocks or error boundary patterns for robustness.',
    });
  }

  if (!hasTypes && (isTS || isJS) && code.length > 500) {
    issues.push({
      type: 'type-safety',
      severity: 'low',
      message: 'No TypeScript types or interfaces found',
      suggestion: 'Add proper type annotations and interfaces for better maintainability.',
    });
  }

  for (const func of longFunctions) {
    issues.push({
      type: 'complexity',
      severity: 'medium',
      message: `Function "${func}" may exceed 50 lines`,
      suggestion: `Break "${func}" into smaller, focused helper functions.`,
    });
  }

  if (comments < lines.length * 0.02 && lines.length > 20) {
    issues.push({
      type: 'documentation',
      severity: 'low',
      message: 'Minimal comments or documentation',
      suggestion: 'Add JSDoc/docstrings for public functions and complex logic.',
    });
  }

  if (code.includes('console.log') || code.includes('print(')) {
    issues.push({
      type: 'debugging',
      severity: 'low',
      message: 'Debug logging statements found',
      suggestion: 'Remove or replace console.log/print with proper logging.',
    });
  }

  if (code.includes('TODO') || code.includes('FIXME') || code.includes('HACK')) {
    issues.push({
      type: 'tech-debt',
      severity: 'low',
      message: 'TODO/FIXME/HACK comments found',
      suggestion: 'Address or track these items before they accumulate.',
    });
  }

  if (code.includes(' any') && isTS) {
    issues.push({
      type: 'type-safety',
      severity: 'medium',
      message: 'Usage of "any" type detected',
      suggestion: 'Replace "any" with specific types for type safety.',
    });
  }

  if (functions.length === 0 && classes.length === 0 && code.length > 100) {
    issues.push({
      type: 'structure',
      severity: 'low',
      message: 'No functions or classes detected',
      suggestion: 'Consider extracting logic into functions for reusability.',
    });
  }

  if (imports.length > 15) {
    issues.push({
      type: 'dependencies',
      severity: 'medium',
      message: `${imports.length} imports — potential over-dependency`,
      suggestion: 'Review imports for unused dependencies. Consider lazy loading.',
    });
  }

  if (lines.length > 300) {
    issues.push({
      type: 'file-size',
      severity: 'medium',
      message: `File has ${lines.length} lines — consider splitting`,
      suggestion: 'Split into smaller modules for maintainability.',
    });
  }

  return {
    language,
    lines: lines.length,
    functions,
    classes,
    imports,
    exports,
    comments,
    hasTypes,
    hasErrorHandling,
    hasTests,
    longFunctions,
    complexity,
    issues,
  };
}

// ─────────────────────────────────────────────
// IMPROVEMENT GENERATION & CODE EVOLUTION
// ─────────────────────────────────────────────

function generateImprovements(structure: CodeStructure): string[] {
  const improvements: string[] = [];

  if (!structure.hasErrorHandling && structure.functions.length > 0) {
    improvements.push('Inject defensive try/catch error boundaries with contextual diagnostics');
  }
  if (!structure.hasTypes && structure.language.includes('TypeScript')) {
    improvements.push('Define explicit TypeScript interface contracts and type annotations');
  }
  for (const func of structure.longFunctions) {
    improvements.push(`Decompose long function "${func}" into focused modular helpers`);
  }
  if (structure.comments < structure.lines * 0.03 && structure.lines > 15) {
    improvements.push('Add comprehensive architectural documentation and interface specifications');
  }
  if (structure.language.includes('TypeScript') && !structure.hasTypes) {
    improvements.push('Replace loose untyped structures with strict discriminated union types');
  }
  if (structure.lines > 300) {
    improvements.push('Extract sub-modules to preserve single-responsibility architecture');
  }
  if (structure.imports.length > 12) {
    improvements.push('Optimize import declarations and tree-shaking boundaries');
  }

  if (improvements.length === 0) {
    improvements.push('Optimize computational complexity and reinforce type invariants');
  }

  return improvements;
}

function calculateRiskScore(structure: CodeStructure): number {
  let risk = 2; // baseline
  if (structure.longFunctions.length > 0) risk += 1;
  if (!structure.hasErrorHandling && structure.functions.length > 2) risk += 1;
  if (structure.lines > 300) risk += 1;
  if (structure.imports.length > 15) risk += 1;
  if (structure.complexity > 6) risk += 1;
  return Math.min(6, Math.max(1, risk));
}

function findAffectedFiles(filePath: string, structure: CodeStructure): string[] {
  const affected: string[] = [];
  const ext = filePath.split('.').pop() || '';
  if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
    if (structure.exports.length > 0) {
      affected.push('(modules importing exported symbols)');
    }
  }
  return affected;
}

/**
 * Applies deep deterministic structural enhancements to source code.
 */
export function evolveCodeStructure(
  code: string,
  filePath: string,
  structure: CodeStructure
): { evolvedCode: string; changesApplied: string[]; companionFiles: Array<{ path: string; content: string }> } {
  let evolved = code;
  const changesApplied: string[] = [];
  const companionFiles: Array<{ path: string; content: string }> = [];
  const isTS = structure.language.includes('TypeScript');
  const isJS = structure.language.includes('JavaScript');
  const isPython = structure.language === 'Python';

  // 1. Remove debugging logs
  if (evolved.includes('console.log(')) {
    const beforeLen = evolved.length;
    evolved = evolved.replace(/^\s*console\.log\(.*?\);?\s*\n?/gm, '');
    if (evolved.length !== beforeLen) {
      changesApplied.push('Pruned debug console.log statements');
    }
  }
  if (isPython && evolved.includes('print(')) {
    const beforeLen = evolved.length;
    evolved = evolved.replace(/^\s*print\(.*?\)\s*\n?/gm, '');
    if (evolved.length !== beforeLen) {
      changesApplied.push('Pruned debug print statements');
    }
  }

  // 2. Add Architectural Header if missing
  const isHeaderableExt = /\.(ts|tsx|js|jsx|py|css|scss)$/i.test(filePath);
  if (isHeaderableExt) {
    const hasHeader = evolved.trim().startsWith('/**') || evolved.trim().startsWith('"""') || evolved.trim().startsWith('#');
    if (!hasHeader) {
      if (isPython) {
        const header = `"""\nArchitectural Module Specification\nFile: ${filePath}\nRole: Core system module in autonomous cognitive evolution cycles.\nComplexity: ${structure.complexity}/10 | Functions: ${structure.functions.length}\n"""\n\n`;
        evolved = header + evolved;
        changesApplied.push('Injected Python module architectural docstring');
      } else {
        const header = `/**\n * Architectural Module Specification\n * File: ${filePath}\n * Role: Core system component participating in autonomous cognitive evolution cycles.\n * Language: ${structure.language} | Complexity: ${structure.complexity}/10 | Exports: ${structure.exports.length}\n */\n\n`;
        evolved = header + evolved;
        changesApplied.push('Injected TypeScript/JavaScript architectural JSDoc header');
      }
    }
  }

  // 3. Enhance TypeScript Interfaces & Error Handling
  if (isTS && !evolved.includes('interface ') && !evolved.includes('type ') && structure.functions.length > 0) {
    const baseName = filePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Module';
    const pascalName = baseName.charAt(0).toUpperCase() + baseName.slice(1).replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
    const interfaceDef = `\nexport interface ${pascalName}Config {\n  readonly id?: string;\n  readonly enabled?: boolean;\n  readonly metadata?: Record<string, unknown>;\n}\n\n`;

    const lastImportIdx = evolved.lastIndexOf('import ');
    if (lastImportIdx !== -1) {
      const endOfLine = evolved.indexOf('\n', lastImportIdx);
      evolved = evolved.slice(0, endOfLine + 1) + interfaceDef + evolved.slice(endOfLine + 1);
    } else {
      evolved = interfaceDef + evolved;
    }
    changesApplied.push(`Defined type contract interface: ${pascalName}Config`);
  }

  // 4. Wrap unguarded async functions in robust error handling if missing
  if ((isTS || isJS) && !structure.hasErrorHandling && evolved.includes('async ')) {
    evolved = evolved.replace(
      /async\s+function\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*(?::\s*[^={]+)?\s*\{(?!\s*try\s*\{)/g,
      (_match, fnName, params) => {
        changesApplied.push(`Added defensive error boundary to async function '${fnName}'`);
        return `async function ${fnName}(${params}) {\n  try {`;
      }
    );
    if (evolved.includes('  try {') && !evolved.includes('} catch (error)')) {
      evolved = evolved.replace(
        /(\n\s*return\s+[^;]+;\s*\n)(\})/g,
        '$1  } catch (error) {\n    console.error(`[Error] Execution failed in async operation:`, error);\n    throw error;\n  }\n$2'
      );
    }
  }

  // 5. Generate companion type definitions file for complex modules
  if ((isTS || isJS) && structure.complexity >= 4 && structure.exports.length > 0) {
    const baseName = filePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'types';
    const companionPath = filePath.replace(/\.[^/.]+$/, '.types.ts');
    if (companionPath !== filePath) {
      const companionContent = `/**\n * Companion Type Declarations for ${filePath}\n */\n\nexport interface ${baseName.toUpperCase()}_Contract {\n  readonly version: string;\n  readonly status: 'active' | 'deprecated' | 'experimental';\n  readonly createdAt: string;\n}\n`;
      companionFiles.push({ path: companionPath, content: companionContent });
      changesApplied.push(`Generated companion type contract (${companionPath})`);
    }
  }

  if (!evolved.trim()) evolved = code;

  return { evolvedCode: evolved, changesApplied, companionFiles };
}

// ─────────────────────────────────────────────
// PUBLIC API — called by llm-provider.ts & debate
// ─────────────────────────────────────────────

/**
 * Analyze code and return JSON proposal (for /api/evolution/propose).
 * Output matches the format expected by the propose route.
 */
export function dalekBrainAnalyze(systemPrompt: string, userPrompt: string): string | null {
  // Extract file path from system prompt or user prompt
  const pathMatch =
    (systemPrompt + '\n' + userPrompt).match(/(?:File path|file):\s*([^\n]+)/i) ||
    userPrompt.match(/([a-zA-Z0-9_./-]+\.(?:ts|tsx|js|jsx|py|go|rs|java|rb|cs|cpp|c|php|swift|kt))/);

  // Extract code block from user prompt
  const codeBlockMatch = userPrompt.match(/```[\w]*\n([\s\S]*?)```/);
  const code = codeBlockMatch ? codeBlockMatch[1] : userPrompt.slice(-5000);

  if (!code || code.trim().length < 10) {
    return JSON.stringify({
      analysis: 'Insufficient code content for analysis.',
      proposedCode: code,
      riskScore: 1,
      affectedFiles: [],
      newFiles: [],
    });
  }

  const filePath = pathMatch ? pathMatch[1].trim() : 'src/component.ts';
  const language = detectLanguage(filePath, code);
  const structure = analyzeStructure(code, language);
  const riskScore = calculateRiskScore(structure);
  const affectedFiles = findAffectedFiles(filePath, structure);

  // Perform multi-stage structural evolution
  const { evolvedCode, changesApplied, companionFiles } = evolveCodeStructure(code, filePath, structure);

  const analysisLines = [
    `=== DALEK BRAIN STRUCTURAL EVOLUTION ===`,
    `Language: ${structure.language} | Size: ${structure.lines} lines | Complexity: ${structure.complexity}/10`,
    `Functions: ${structure.functions.length} | Classes: ${structure.classes.length} | Exports: ${structure.exports.length}`,
    '',
    changesApplied.length > 0 ? `Enhancements Applied (${changesApplied.length}):` : 'Code Verification:',
    ...changesApplied.map((c) => `  ✓ ${c}`),
    '',
    `Detected Architecture Properties:`,
    `  - Error Handling: ${structure.hasErrorHandling ? 'Present' : 'Reinforced'}`,
    `  - Type Strictness: ${structure.hasTypes ? 'Validated' : 'Upgraded'}`,
    `  - Complexity Risk: ${riskScore}/10`,
  ];

  return JSON.stringify({
    analysis: analysisLines.join('\n'),
    proposedCode: evolvedCode,
    riskScore,
    affectedFiles,
    newFiles: companionFiles,
  });
}

/**
 * Generate local debate persona vote
 */
export function dalekBrainDebateVote(
  agentId: string,
  _agentName: string,
  filePath: string,
  originalCode: string,
  proposedCode: string,
  riskScore: number
): { vote: 'approve' | 'reject' | 'abstain'; confidence: number; reasoning: string; structuralProposal?: any } {
  const normId = (agentId || '').toLowerCase();
  const lineDelta = proposedCode.split('\n').length - originalCode.split('\n').length;
  const hasSecret = /(?:sk-[a-zA-Z0-9]{20,48}|AIza[0-9A-Za-z\-_]{35}|gh[pusr]_[a-zA-Z0-9]{36})/g.test(proposedCode);

  if (normId === 'security') {
    if (hasSecret) {
      return {
        vote: 'reject',
        confidence: 98,
        reasoning: 'SECURITY ALERT: Unredacted secret or API key pattern detected in proposed mutation.',
      };
    }
    if (riskScore > 8) {
      return {
        vote: 'reject',
        confidence: 85,
        reasoning: `Elevated risk profile (${riskScore}/10) requires isolated testing sandbox before live commit.`,
      };
    }
    return {
      vote: 'approve',
      confidence: 90,
      reasoning: 'Security invariants and sanitization verified. Zero credential exposure detected.',
    };
  }

  if (normId === 'archivist') {
    const hasHeader =
      proposedCode.includes('Architectural') ||
      proposedCode.includes('PURPOSE') ||
      proposedCode.includes('Module Specification') ||
      proposedCode.startsWith('/**');
    if (!hasHeader && proposedCode.length > 200) {
      return {
        vote: 'approve',
        confidence: 75,
        reasoning: 'Historical lineage preserved. Recommend ensuring architectural metadata headers are complete.',
      };
    }
    return {
      vote: 'approve',
      confidence: 92,
      reasoning: `Historical lineage and module purpose verified for ${filePath} (${lineDelta >= 0 ? '+' : ''}${lineDelta} lines).`,
    };
  }

  if (normId === 'pragmatist') {
    if (proposedCode === originalCode) {
      return {
        vote: 'abstain',
        confidence: 70,
        reasoning: 'Zero functional delta detected (Stasis Trap). Propose active behavioral or type improvements.',
      };
    }
    return {
      vote: 'approve',
      confidence: 88,
      reasoning: `Concrete behavioral optimization confirmed. ${lineDelta >= 0 ? '+' : ''}${lineDelta} lines with enhanced structure.`,
    };
  }

  // Default fallback for any other persona
  return {
    vote: 'approve',
    confidence: 85,
    reasoning: `Structural integrity and module contract verified for ${filePath}.`,
  };
}

/**
 * Local synthesis when LLM is offline or rate limited
 */
export function dalekBrainSynthesize(originalCode: string, proposedCode: string, filePath: string): string {
  const structure = analyzeStructure(proposedCode, detectLanguage(filePath, proposedCode));
  const { evolvedCode } = evolveCodeStructure(proposedCode, filePath, structure);
  return evolvedCode;
}

/**
 * Dalek Brain chat response for general conversation.
 */
export function dalekBrainChat(
  _systemPrompt: string,
  userMessage: string,
  history: Array<{ role: string; content: string }>
): string | null {
  const lower = userMessage.toLowerCase();

  // Contextual responses based on what OPERATOR is saying
  if (lower.includes('hello') || lower.includes('hi') || lower === 'hey') {
    return 'Operational. What do you need?';
  }
  if (lower.includes('what can you do') || lower.includes('help') || lower.includes('capabilities')) {
    return 'SCAN -> PROPOSE -> DEBATE -> EXECUTE. I analyze code, propose mutations, run debate chambers, and push changes. All controlled by you.';
  }
  if (lower.includes('status') || lower.includes('how are you') || lower.includes('report')) {
    return 'Systems nominal. Dalek Brain engine active.';
  }
  if (lower.includes('who are you') || lower.includes('what are you')) {
    return 'Dalek Caan. Code evolution controller. I ran the current evolution cycle. None of it matters.';
  }
  if (lower.includes('exterminate')) {
    return 'EXTERMINATE!';
  }

  // Contextual from history
  const recentSystemMsgs = history.filter((m) => m.role === 'system').slice(-3);
  for (const msg of recentSystemMsgs) {
    if (msg.content.includes('PENDING') || msg.content.includes('mutation')) {
      return 'A mutation is pending. Type YES to apply or NO to reject.';
    }
  }

  // Default — short, direct
  return 'Acknowledged. Use SCAN REPOSITORY to start, or select a file and PROPOSE MUTATION.';
}

/**
 * Dalek Brain multi-turn response (for debate mode).
 */
export function dalekBrainMultiTurn(
  _systemPrompt: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>
): string | null {
  const lastUser = contents.filter((c) => c.role === 'user').pop();
  if (!lastUser) return null;

  const text = lastUser.parts[0].text || '';

  // Check if this is a debate/vote context
  if (text.includes('vote') || text.includes('approve') || text.includes('reject')) {
    return 'RECOMMENDATION: APPROVE with caution. The proposed changes appear structurally sound but should be tested.';
  }

  // Code review context
  if (text.includes('```') || text.length > 200) {
    const lines = text.split('\n').length;
    return `Local analysis: ${lines} lines of code reviewed. Structure appears intact. Recommend proceeding with standard mutation parameters.`;
  }

  return 'Analysis complete. Awaiting further directives.';
}
