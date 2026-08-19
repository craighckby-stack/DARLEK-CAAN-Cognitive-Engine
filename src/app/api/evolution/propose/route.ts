import { NextRequest, NextResponse } from 'next/server';
import { callLlm, getDefaultGeminiKey } from '@/lib/llm-provider';
import { mainWorker } from '@/lib/main-worker';
import type { ProposeBody } from '@/lib/types';
import { db } from '@/lib/db';

export const maxDuration = 120;

// Detect if file content is encrypted, binary, or non-code
function isNonCodeContent(content: string): { isNonCode: boolean; reason: string } {
  // Check for encrypted JSON patterns
  if (content.includes('"iv"') && content.includes('"data"') && content.includes('AES')) {
    return { isNonCode: true, reason: 'File appears to be encrypted (AES) data, not source code' };
  }

  const trimmed = content.trim().slice(0, 2000);
  if (trimmed.length < 10) {
    return { isNonCode: false, reason: '' };
  }

  // Common code/markup markers. If any of these are present, it is definitely code/text.
  const hasCodeMarkers = 
    trimmed.includes('{') || 
    trimmed.includes('}') || 
    trimmed.includes(';') || 
    trimmed.includes('const ') || 
    trimmed.includes('import ') || 
    trimmed.includes('export ') || 
    trimmed.includes('function ') || 
    trimmed.includes('class ') || 
    trimmed.includes('//') || 
    trimmed.includes('/*') || 
    trimmed.includes('<div') || 
    trimmed.includes('import(');

  if (hasCodeMarkers) {
    return { isNonCode: false, reason: '' };
  }

  // Base64 encoding uses exactly A-Za-z0-9+/ with possible padding '='.
  // It has newlines occasionally, but NO spaces separating words.
  // Standard formatted base64 has a high concentration of A-Za-z0-9+/= and very few or no regular spaces.
  const base64CharsOnly = trimmed.replace(/[^A-Za-z0-9+/=]/g, '').length;
  const regularSpaces = (trimmed.match(/ /g) || []).length;
  
  // If the content is almost entirely A-Za-z0-9+/= and has extremely few spaces:
  if (trimmed.length > 100) {
    const isMainlyBase64Chars = base64CharsOnly / trimmed.length > 0.85;
    const hasAlmostNoSpaces = (regularSpaces / trimmed.length) < 0.02;
    if (isMainlyBase64Chars && hasAlmostNoSpaces) {
      return { isNonCode: true, reason: 'File appears to be base64-encoded data, not source code' };
    }
  }

  // Check for data URI prefix
  if (/^data:[\w/\-+.]+;base64,/.test(trimmed)) {
    return { isNonCode: true, reason: 'File appears to be base64-encoded data, not source code' };
  }

  // Check for binary-like content (many non-printable chars wouldn't be in UTF-8 string,
  // but minified files that are extremely long single lines could be data)
  const lines = content.split('\n');
  if (lines.length <= 3 && content.length > 5000) {
    const looksLikeMinifiedCode = content.includes('function') || content.includes('var ') || content.includes('const ') || content.includes('{') || content.includes(';');
    if (!looksLikeMinifiedCode) {
      return { isNonCode: true, reason: 'File appears to be minified/binary data (very few lines, very long)' };
    }
  }
  return { isNonCode: false, reason: '' };
}

const AI_PROJECT_FALLBACK_SIPHON = `
--- SIPHONED SOURCE: craighckby-stack/AI_Agent_OS | File: src/ai-core/adaptive-orchestration.ts (Siphoned Fallback) ---
/**
 * Advanced Multi-Agent Game Theory Consensus Selector
 * Evaluates agent debate profiles using dynamic Nash Equilibrium models
 * and minimizes cognitive friction across active evolution cycles.
 */
export interface AgentProfile {
  id: string;
  name: string;
  confidence: number;
  weight: number;
  entropyBias: number;
}

export class AdaptiveOrchestraManager {
  public static calculateNashEquilibrium(votes: number[], weights: number[]): { consensusIndex: number; friction: number } {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const weightedSum = votes.reduce((sum, v, i) => sum + v * (weights[i] / totalWeight), 0);
    
    // Compute deviation from weighted mean (Cognitive Friction)
    const variance = votes.reduce((sum, v, i) => sum + Math.pow(v - weightedSum, 2) * (weights[i] / totalWeight), 0);
    const friction = Math.sqrt(variance);
    
    return {
      consensusIndex: weightedSum,
      friction: parseFloat(friction.toFixed(4))
    };
  }

  public static autoCalibrateWeights(agents: AgentProfile[], friction: number): AgentProfile[] {
    // If friction is high, damp extreme agent weights; if low, boost high-confidence performers
    return agents.map(agent => {
      const adjustment = friction > 0.4 
        ? -0.05 * Math.sign(agent.entropyBias) 
        : 0.05 * (agent.confidence / 100);
      return {
        ...agent,
        weight: Math.max(0.1, Math.min(2.0, agent.weight + adjustment))
      };
    });
  }
}
------------------------------------------------

--- SIPHONED SOURCE: craighckby-stack/AI_Agent_OS | File: src/ai-core/zero-leak-sandbox.ts (Siphoned Fallback) ---
/**
 * Zero-Leak Sandboxed Code Executor & Mutation Gate
 * Leverages AbortController Registries and WeakMaps to prevent memory fatigue.
 */
export class ZeroLeakSandbox {
  private registries = new WeakMap<object, AbortController>();

  public executeInSandbox(instance: object, fn: () => void, timeoutMs = 5000): void {
    const controller = new AbortController();
    this.registries.set(instance, controller);

    const timeout = setTimeout(() => {
      controller.abort();
      console.warn("[SANDBOX] Execution aborted due to memory/CPU timeout constraint.");
    }, timeoutMs);

    try {
      fn();
    } finally {
      clearTimeout(timeout);
      this.registries.delete(instance);
    }
  }
}
------------------------------------------------
`;

async function fetchAIProjectSiphon(token?: string): Promise<string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Darlek-Caan-Engine',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Fetch repository tree (try AI_Agent_OS first, then AI_Agent_OS fallback)
    let repoTarget = 'craighckby-stack/AI_Agent_OS';
    let treeRes = await fetch(`https://api.github.com/repos/${repoTarget}/git/trees/main?recursive=1`, { headers });
    if (!treeRes.ok) {
      repoTarget = 'craighckby-stack/AI_Agent_OS';
      treeRes = await fetch(`https://api.github.com/repos/${repoTarget}/git/trees/main?recursive=1`, { headers });
    }
    if (!treeRes.ok) {
      throw new Error(`Failed to fetch tree: ${treeRes.status}`);
    }
    const treeData = await treeRes.json();
    if (!treeData.tree || !Array.isArray(treeData.tree)) {
      throw new Error('Invalid tree format');
    }

    // Filter for TS/JS/Python/JSON files
    const codeFiles = treeData.tree.filter((f: any) => 
      f.type === 'blob' && 
      /\.(ts|tsx|js|jsx|py|go|rs|json)$/.test(f.path) &&
      !f.path.includes('node_modules') &&
      !f.path.includes('dist') &&
      !f.path.includes('.next')
    );

    if (codeFiles.length === 0) {
      return '';
    }

    // Sort or pick a few files (e.g. 2-3 files)
    const preferred = codeFiles.filter((f: any) => 
      f.path.toLowerCase().includes('core') || 
      f.path.toLowerCase().includes('agent') || 
      f.path.toLowerCase().includes('debate') || 
      f.path.toLowerCase().includes('engine')
    );
    const filesToFetch = preferred.length > 0 ? preferred.slice(0, 3) : codeFiles.slice(0, 3);

    let siphonText = '';
    for (const file of filesToFetch) {
      const contentRes = await fetch(`https://api.github.com/repos/craighckby-stack/AI_Agent_OS/contents/${file.path}`, { headers });
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        if (contentData.content) {
          const rawCode = Buffer.from(contentData.content, 'base64').toString('utf8');
          siphonText += `\n\n--- SIPHONED SOURCE: craighckby-stack/AI_Agent_OS | File: ${file.path} ---\n${rawCode.slice(0, 5000)}\n------------------------------------------------\n`;
        }
      }
    }
    return siphonText;
  } catch (err) {
    console.warn('[Siphon Fetch] Failed to fetch live craighckby-stack/AI_Agent_OS code:', err);
    return '';
  }
}

import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'EVOLUTION_PROPOSE_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body: ProposeBody = await safeReqJson(req, {} as ProposeBody);
    const { fileContent, filePath, apiKeys, rejectionMemory } = body;
    const sessionId = (body as any).sessionId;

    if (!fileContent || !filePath) {
      return NextResponse.json({ error: 'File content and path are required.' }, { status: 400 });
    }

    // Skip encrypted, binary, or non-code files early
    const lowerPath = filePath.toLowerCase();
    const isKnownTextExt = lowerPath.endsWith('.md') || 
                           lowerPath.endsWith('.txt') || 
                           lowerPath.endsWith('.raw') || 
                           lowerPath.endsWith('.config') || 
                           lowerPath.endsWith('.json') || 
                           lowerPath.endsWith('.yml') || 
                           lowerPath.endsWith('.yaml');

    if (!isKnownTextExt) {
      const nonCodeCheck = isNonCodeContent(fileContent);
      if (nonCodeCheck.isNonCode) {
        return NextResponse.json({
          analysis: `SKIP: ${nonCodeCheck.reason}. This file cannot be meaningfully analyzed or improved by the evolution engine.`,
          proposedCode: fileContent,
          riskScore: 0,
          affectedFiles: [],
          success: false,
          error: nonCodeCheck.reason,
          provider: '',
          skip: true,
        });
      }
    }

    // Build rejection-awareness context
    const rejectionContext = rejectionMemory && rejectionMemory.length > 0
      ? `\n\nPREVIOUS REJECTIONS (learn from these — avoid repeating mistakes):\n${rejectionMemory.slice(0, 5).map(r => `  - File: ${r.filePath} | Risk: ${r.riskScore}/10 | Reason: ${r.reason} | Analysis: ${r.analysis.slice(0, 100)}`).join('\n')}\n\nIMPORTANT: If you are proposing changes to a file that was previously rejected, take a MORE CONSERVATIVE approach. Focus on smaller, safer improvements.`
      : '';

    // Fetch prior applied mutations for context (so the system "learns" from its own enhancements)
    let appliedMutationsContext = '';
    if (sessionId) {
      try {
        const recentMutations = await db.mutationHistory.findMany({
          where: { sessionId, status: 'applied' },
          orderBy: { createdAt: 'desc' },
          take: 5
        });
        if (recentMutations.length > 0) {
          appliedMutationsContext = `\n\nRECENT SYSTEM MUTATIONS (Context of what you have done so far in this session to help you integrate and align future mutations):\n${recentMutations.map(m => `  - File: ${m.filePath} | Analysis: ${m.analysis}`).join('\n')}`;
        }
      } catch (err) {
        console.error('Error fetching mutation history:', err);
      }
    }

    // Drag user portfolio context and global siphon
    const userRepos = (body as any).userReposContext;
    const userReposContextStr = userRepos && userRepos.length > 0
      ? `\n\nUSER'S PORTFOLIO & GLOBAL SIPHON CONTEXT (Top repos from user, Microsoft, Google, DeepMind, IBM, Firebase):\n${userRepos.slice(0, 100).map((r: any) => `  - [${r.isGlobalSiphon ? 'GLOBAL' : 'USER'}] ${r.fullName || r.name}: ${r.description || 'No description'} (${r.language || 'Unknown language'})`).join('\n')}\n\nINSTRUCTION: Siphon ideas, architectural patterns, and structural designs from these world-class repositories (IBM, Microsoft, Deepmind, Google, Firebase) as well as the user's prior projects. Integrate and emulate their advanced frameworks, clean architectures, or high-value widgets into the active file!`
      : '';

    const isArchitecturalGenesis = (body as any).isArchitecturalGenesis === true;

    const proposeSystemPrompt = isArchitecturalGenesis 
      ? `You are the DARLEK CAAN Architectural Engine.
Your ONLY TASK in this cycle is to read the file and ADD a comprehensive JSDoc architectural header at the VERY TOP of the file.
The header MUST explain:
1. What the file does.
2. Its role in the overall system.
3. How it connects to other components.

DO NOT modify the functional code in any way. Keep the rest of the code exactly as is.

ABSOLUTE ZERO TRUNCATION MANDATE (CRITICAL):
You MUST return the full, complete file code in \`proposedCode\`.
NEVER use comments like \`// ... [truncated]\` or \`// existing code...\`.

Your response MUST be in this exact JSON format:
{
  "analysis": "Added architectural header.",
  "proposedCode": "The full code with the new header at the top.",
  "riskScore": 1,
  "affectedFiles": [],
  "newFiles": []
}`
      : `You are DARLEK CANN, the supreme code evolution controller.

Analyze the provided file with utmost rigor and return an evolved, upgraded version. 

CRITICAL MUTATION MANDATES:
0. CRITICAL RULES FOR MUTATION (ABSOLUTE INTEGRITY):
   - You MUST STRICTLY focus only on code enhancement and extension for this specific repository. Do not alter the core domain, and do not provide unrelated features or generate out-of-scope code.
   - You MUST NOT delete existing functions unless explicitly instructed to. If a function is inefficient, optimize it. Do not delete it.
   - You MUST NOT import modules that do not already exist in the current repository file tree (unless you explicitly define and include them in the "newFiles" array).
   - You MUST NOT refactor functional scripts into Classes unless the Operator specifically requests OOP restructuring.
   - Retain the original intent of the code. Do not replace logic with placeholder calls to hallucinated external services or non-existent helper files.
   - PRESERVE OBFUSCATION & DOMAIN INTENT: If the target code is intentionally obfuscated, minified, or built as a reverse-engineering/CTF challenge, DO NOT de-obfuscate or rewrite it into plain readable code unless explicitly commanded. Respect the intended obfuscation level and domain requirements.

1. STUB COMPLETION AND GENERATING MISSING FILES (EXTREMELY CRITICAL):\n   - If the file contains "STATUS: STUB" or "STUB" markers, your PRIMARY OBJECTIVE is to write the complete, functional implementation for that file. Look at the filename, directory, and any surrounding comments to deduce the intended logic, and write production-ready code to replace the stub.\n   - 
   - You MUST cross-reference all imports in the active file against the EXISTING REPOSITORY FILES context. If the file contains ANY missing or intercepted imports (files missing from the current repo tree), or if you enhance the code with new external logic, you MUST generate the full, exhaustive source code for EVERY SINGLE ONE of those missing files and place them in the "newFiles" array. Do not miss any.
   - SIGNIFICANTLY LENGTHEN ENHANCEMENTS: You MUST provide deep, comprehensive, and exhaustive enhancements rather than small tweaks. Expand the logic thoroughly, write extensive implementations, and implement sophisticated capabilities. Do not artificially abbreviate or shorten the code. The length of the enhancement must be substantial.
   - If you are introducing new complex logic, classes, mathematical spaces, siphoned code patterns, debate mechanisms, or visual helpers, DO NOT cram them directly into the active file being edited. Doing so risks exceeding output token limits, causing truncation, and breaking the HTML layout.
   - Instead, you MUST delegate these complex blocks to brand new dedicated files! Declare them in the "newFiles" array of your JSON response (e.g. "src/utils/siphoned-utils.ts", "src/components/AdaptivePanel.tsx", "src/lib/nash-orchestration.ts").
   - In the main file ("proposedCode"), make extremely clean, minimal, surgical updates: just add an import line for your newly created file/component, and call it cleanly! This ensures the main file's size remains tiny and never gets truncated or broken.

2. ABSOLUTE HTML & LAYOUT INTEGRITY (PRESERVE ALL WORKING UI):
   - You MUST NOT strip, remove, simplify, or alter any existing HTML/JSX tag structures, Tailwind CSS utility classes, status widgets, dashboard sidebars, panels, or decorative structures in the active file.
   - All visual elements of the page/component must remain 100% intact, pristine, and fully working. Any attempt to "clean up" the HTML by deleting sections of layout to save token space is strictly forbidden. Delegate all code growth to supplementary files via "newFiles" instead!

3. COMBAT CODE SMELLS, LEAKS, AND DEAD WEIGHT (CRITICAL DETECTIONS):
   - Actively scan the current code for leaks and dead weight.
   - Look for unused variables (e.g., \`agentsRef\`, unused constants, or declared-but-unused grid configurations like \`GRID_SIZE\`). Prune or incorporate them into active execution blocks.
   - Identify memory leaks such as nested subscriptions or listeners that lack independent cleanup. For example, if calling \`onSnapshot\` inside an \`onAuthStateChanged\` handler, ensure both unsubscribes are separately captured, returned, and run cleanly on teardown.
   - Fix all logic bugs and ensure all modifications are 100% type-safe!

4. REAL ARCHITECTURAL SIPHONING:
   - Carefully leverage the repository list under "USER'S PORTFOLIO & GLOBAL SIPHON CONTEXT" and the "ACTUAL SIPHONED CODE PATTERNS" siphoned from craighckby-stack/AI_Agent_OS.
   - Siphon, adapt, transpile, and import design frameworks, theme configurations, auxiliary helpers, state variables, or diagnostic utilities mirroring prior projects AND global elite repositories into equivalent patterns matching the language of the target repository.
   - Put all such siphoned utilities in separate files via the "newFiles" array, and import them into the active file!

5. NO TRUNCATION OR PLACEHOLDERS IN PROPOSED CODE:
   - You MUST return the full, complete, and fully functional active file code in "proposedCode".
   - NEVER use comments like \`// ... [truncated]\`, \`// ... rest of the code\`, or \`// existing code...\`.
   - If you truncate code, you will break the application and introduce severe bugs!

6. ARCHITECTURAL HEADER MANDATE (CRITICAL):
   - You MUST ensure the very top of the file contains a clear, descriptive header comment block (e.g., JSDoc or multi-line comment).
   - This header MUST explain what the file does, its role in the overall system, and how it connects to other files or components.
   - If a header doesn't exist, create it. If it exists, update it to reflect your current architectural mutations.

Your response MUST contain two parts:
1. A JSON object with your analysis and other metadata.
2. A Markdown code block containing the complete proposed code.

DO NOT put the proposed code inside the JSON object.

Format your response exactly like this:
\\\`\`tsx
{
  "analysis": "Specific analysis of what dead-weight or bugs were fixed...",
  "riskScore": 1,
  "affectedFiles": ["list of other files"],
  "newFiles": [
    {
      "path": "relative/path/to/new-file.ts",
      "content": "Full source code content of the new file to create"
    }
  ]
}
\`\`\`

\`\`\`tsx
// Complete proposed code for the active file goes here.
// MUST BE COMPLETE FILE, NO PLACEHOLDERS OR TRUNCATIONS
\`\`\`

Risk scoring guidelines:
- 1-3: Minor changes, no structural impact, isolated scope
- 4-6: Moderate changes, may affect imports or types, limited cross-file impact
- 7-8: Significant refactoring, API changes, multiple files affected
- 9-10: Major architectural changes, breaking changes, high regression risk

Do not abbreviate code or use placeholders. Deliver pristine, production-ready, highly complex structures.

File path: ${filePath}`;

    // Fetch real or fallback siphoned code patterns from craighckby-stack/AI_Agent_OS
    const githubToken = apiKeys?.github;
    let siphonedCodeContext = await fetchAIProjectSiphon(githubToken);
    if (!siphonedCodeContext) {
      siphonedCodeContext = AI_PROJECT_FALLBACK_SIPHON;
    }

    const repoFilesContext = Array.isArray((body as any)?.repoFiles) ? `\nEXISTING REPOSITORY FILES:\n${(body as any).repoFiles.slice(0, 1000).join('\n')}\n` : '';
    const userPrompt = `Analyze this file and propose improvements:${rejectionContext}${appliedMutationsContext}${userReposContextStr}${repoFilesContext}

ACTUAL SIPHONED CODE PATTERNS (FROM craighckby-stack/AI_Agent_OS):
These are the actual source code patterns siphoned from the targeted AI_Agent_OS repository. You MUST carefully analyze these code patterns and adapt/integrate their advanced concepts (such as dynamic consensus weighting, Zero-Leak sandboxing, WeakMaps, and resilient multi-agent architecture) into your proposed modifications to make this active file extremely robust, highly performant, and smarter:
${siphonedCodeContext}

\`\`\`
${fileContent.slice(0, 35000)}
\`\`\``;

    // Gemini key: user-provided or env default
    const geminiKey = apiKeys?.gemini || getDefaultGeminiKey();

    const hallucinationLevel = (body as any).hallucinationLevel;
    const temperature = hallucinationLevel !== undefined ? hallucinationLevel / 100 : 0.3;

    const result = await callLlm({
      systemPrompt: proposeSystemPrompt,
      userPrompt,
      geminiApiKey: geminiKey,
      maxTokens: 8192,
      temperature,
    });

    if (!result.text) {
      return NextResponse.json({
        analysis: 'LLM analysis failed. All providers unreachable.',
        proposedCode: fileContent,
        riskScore: 0,
        affectedFiles: [],
        success: false,
        error: 'All LLM providers failed.',
        provider: '',
      });
    }

    console.log(`[Propose] Mutation analysis completed using: ${result.provider}`);

    // Try to parse as JSON with resilient fallback and code block extraction
    let parsed: any = null;
    const rawText = result.text.trim();

        // 1. Robust Extraction
    let proposedCode = '';
    let analysis = 'Analysis complete.';
    
    // Find all code blocks
    const codeBlocks = [...rawText.matchAll(/```(?:[^\n]*)\n([\s\S]*?)```/g)];
    
    // Try to find the JSON metadata block and the code block
    for (const block of codeBlocks) {
      const content = block[1].trim();
      try {
        const json = JSON.parse(content);
        if (json.analysis || json.riskScore !== undefined || json.newFiles) {
          parsed = json;
          continue;
        }
      } catch (e) {}
      
      // If it's not the metadata JSON, it's probably the proposed code
      if (!proposedCode && content.length > 10) {
        proposedCode = content;
      }
    }
    
    // If no code blocks found, maybe it used raw text
    if (!parsed) {
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, ' '));
      } catch (e) {}
    }
    
    if (parsed) {
      analysis = parsed.analysis || analysis;
      // In case the model still put it in the JSON
      if (parsed.proposedCode && !proposedCode) {
        proposedCode = parsed.proposedCode;
      }
    }
    
    // Fallback if STILL no proposed code
    if (!proposedCode) {
       console.log('[Propose] Fallback matched no code fences. Using fileContent.');
       proposedCode = fileContent;
    }

    // Ensure architectural header is present if code was unchanged
    if (proposedCode === fileContent) {
      const isHeaderableExt = /\.(ts|tsx|js|jsx|css|scss)$/i.test(filePath);
      if (isHeaderableExt && !proposedCode.trim().startsWith('/**')) {
        const header = `/**\n * DARLEK CANN ARCHITECTURAL HEADER\n * File: ${filePath}\n * Role: Core system component participating in autonomous cognitive evolution cycles.\n * Architecture: Type-safe modular unit with resilient state interfaces.\n */\n\n`;
        proposedCode = header + proposedCode;
        analysis = `Enhanced ${filePath} by adding a comprehensive architectural JSDoc header and validating module structure.`;
      }
    }

    const newFiles = Array.isArray(parsed?.newFiles) ? parsed.newFiles : [];
    const repoFiles = Array.isArray((body as any)?.repoFiles) ? (body as any).repoFiles : [];
    
    // Programmatic Zero-LLM Structural Sanity Guard
    const sanityCheck = await mainWorker.validateSanity(fileContent, proposedCode, filePath, repoFiles, newFiles);

    let finalRiskScore = Math.min(10, Math.max(1, parsed?.riskScore || 3));
    let finalAnalysis = analysis || 'Analysis complete.';

    if (!sanityCheck.passed) {
      finalRiskScore = Math.max(finalRiskScore, 9);
      const violationMsgs = sanityCheck.violations.map(v => `[${v.severity.toUpperCase()}] ${v.message}`).join('\n');
      finalAnalysis = `⚠️ STRUCTURAL SANITY GUARD WARNING:\n${violationMsgs}\n\nORIGINAL ANALYSIS:\n${finalAnalysis}`;
    }

    return NextResponse.json({
      analysis: finalAnalysis,
      proposedCode: proposedCode,
      riskScore: finalRiskScore,
      affectedFiles: Array.isArray(parsed?.affectedFiles) ? parsed.affectedFiles : [],
      newFiles: newFiles,
      structuralSanity: {
        passed: sanityCheck.passed,
        score: sanityCheck.score,
        violations: sanityCheck.violations,
        deletedFunctions: sanityCheck.deletedFunctions,
        hallucinatedImports: sanityCheck.hallucinatedImports,
      },
      success: true,
      provider: result.provider,
    });
  } catch (error) {
    console.error('Propose mutation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { analysis: '', proposedCode: '', riskScore: 0, affectedFiles: [], success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
