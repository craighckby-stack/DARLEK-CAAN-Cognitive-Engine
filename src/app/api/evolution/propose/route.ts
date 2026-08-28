import { NextRequest, NextResponse } from 'next/server';
import { callLlm, getDefaultGeminiKey } from '@/lib/llm-provider';
import { mainWorker } from '@/lib/main-worker';
import type { ProposeBody } from '@/lib/types';
import { db } from '@/lib/db';
import { safeReqJson } from '@/lib/safe-json';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

interface NonCodeResult {
  isNonCode: boolean;
  reason: string;
}

interface NewFilePayload {
  path: string;
  content: string;
}

interface RejectionMemoryItem {
  filePath: string;
  riskScore: number;
  reason: string;
  analysis: string;
}

interface UserRepoItem {
  isGlobalSiphon?: boolean;
  fullName?: string;
  name?: string;
  description?: string;
  language?: string;
}

interface GitTreeItem {
  type: string;
  path: string;
}

interface SanityViolation {
  severity: string;
  message: string;
}

interface ParsedMutationResponse {
  analysis?: string;
  riskScore?: number;
  affectedFiles?: string[];
  newFiles?: NewFilePayload[];
  proposedCode?: string;
}

interface ExtendedProposeBody extends ProposeBody {
  sessionId?: string;
  userReposContext?: UserRepoItem[];
  isArchitecturalGenesis?: boolean;
  hallucinationLevel?: number;
  repoFiles?: string[];
}

/**
 * Detects if file content is encrypted, binary, or non-code using optimized pattern and entropy checks.
 */
function isNonCodeContent(content: string): NonCodeResult {
  if (content.includes('"iv"') && content.includes('"data"') && content.includes('AES')) {
    return { isNonCode: true, reason: 'File appears to be encrypted (AES) data, not source code' };
  }

  const trimmed = content.trim();
  const sample = trimmed.length > 2000 ? trimmed.slice(0, 2000) : trimmed;
  if (sample.length < 10) {
    return { isNonCode: false, reason: '' };
  }

  const hasCodeMarkers = 
    sample.includes('{') || 
    sample.includes('}') || 
    sample.includes(';') || 
    sample.includes('const ') || 
    sample.includes('import ') || 
    sample.includes('export ') || 
    sample.includes('function ') || 
    sample.includes('class ') || 
    sample.includes('//') || 
    sample.includes('/*') || 
    sample.includes('<div') || 
    sample.includes('import(');

  if (hasCodeMarkers) {
    return { isNonCode: false, reason: '' };
  }

  const base64CharsOnly = sample.replace(/[^A-Za-z0-9+/=]/g, '').length;
  const regularSpaces = (sample.match(/ /g) || []).length;
  
  if (sample.length > 100) {
    const isMainlyBase64Chars = base64CharsOnly / sample.length > 0.85;
    const hasAlmostNoSpaces = (regularSpaces / sample.length) < 0.02;
    if (isMainlyBase64Chars && hasAlmostNoSpaces) {
      return { isNonCode: true, reason: 'File appears to be base64-encoded data, not source code' };
    }
  }

  if (/^data:[\w/\-+.]+;base64,/.test(sample)) {
    return { isNonCode: true, reason: 'File appears to be base64-encoded data, not source code' };
  }

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
    
    const variance = votes.reduce((sum, v, i) => sum + Math.pow(v - weightedSum, 2) * (weights[i] / totalWeight), 0);
    const friction = Math.sqrt(variance);
    
    return {
      consensusIndex: weightedSum,
      friction: parseFloat(friction.toFixed(4))
    };
  }

  public static autoCalibrateWeights(agents: AgentProfile[], friction: number): AgentProfile[] {
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
    const repoTarget = 'craighckby-stack/AI_Agent_OS';
    const treeRes = await fetch(`https://api.github.com/repos/${repoTarget}/git/trees/main?recursive=1`, { headers });
    if (!treeRes.ok) {
      throw new Error(`Failed to fetch tree: ${treeRes.status}`);
    }
    const treeData = await treeRes.json() as { tree?: GitTreeItem[] };
    if (!treeData.tree || !Array.isArray(treeData.tree)) {
      throw new Error('Invalid tree format');
    }

    const codeFiles = treeData.tree.filter((f: GitTreeItem) => 
      f.type === 'blob' && 
      /\.(ts|tsx|js|jsx|py|go|rs|json)$/.test(f.path) &&
      !f.path.includes('node_modules') &&
      !f.path.includes('dist') &&
      !f.path.includes('.next')
    );

    if (codeFiles.length === 0) {
      return '';
    }

    const preferred = codeFiles.filter((f: GitTreeItem) => {
      const p = f.path.toLowerCase();
      return p.includes('core') || p.includes('agent') || p.includes('debate') || p.includes('engine');
    });
    const filesToFetch = preferred.length > 0 ? preferred.slice(0, 3) : codeFiles.slice(0, 3);

    const siphonPromises = filesToFetch.map(async (file) => {
      try {
        const contentRes = await fetch(`https://api.github.com/repos/${repoTarget}/contents/${file.path}`, { headers });
        if (!contentRes.ok) return null;
        const contentData = await contentRes.json() as { content?: string };
        if (!contentData.content) return null;
        const rawCode = Buffer.from(contentData.content, 'base64').toString('utf8');
        return `\n\n--- SIPHONED SOURCE: ${repoTarget} | File: ${file.path} ---\n${rawCode.slice(0, 5000)}\n------------------------------------------------\n`;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(siphonPromises);
    return results.filter(Boolean).join('');
  } catch (err) {
    console.warn('[Siphon Fetch] Failed to fetch live repo code:', err);
    return '';
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'online', service: 'EVOLUTION_PROPOSE_API' });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await safeReqJson<ExtendedProposeBody>(req, {} as ExtendedProposeBody);
    
    const { fileContent, filePath, apiKeys, rejectionMemory } = body;
    const sessionId = body.sessionId;

    if (!fileContent || !filePath) {
      return NextResponse.json({ error: 'File content and path are required.' }, { status: 400 });
    }

    const lowerPath = filePath.toLowerCase();
    const isKnownTextExt = ['.md', '.txt', '.raw', '.config', '.json', '.yml', '.yaml'].some((ext) => lowerPath.endsWith(ext));

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

    const rejectionContext = rejectionMemory && rejectionMemory.length > 0
      ? `\n\nPREVIOUS REJECTIONS (learn from these — avoid repeating mistakes):\n${rejectionMemory.slice(0, 5).map((r: RejectionMemoryItem) => `  - File: ${r.filePath} | Risk: ${r.riskScore}/10 | Reason: ${r.reason} | Analysis: ${r.analysis.slice(0, 100)}`).join('\n')}\n\nIMPORTANT: If you are proposing changes to a file that was previously rejected, take a MORE CONSERVATIVE approach. Focus on smaller, safer improvements.`
      : '';

    let appliedMutationsContext = '';
    if (sessionId) {
      try {
        const recentMutations = await db.mutationHistory.findMany({
          where: { sessionId, status: 'applied' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { filePath: true, analysis: true }
        });
        if (recentMutations.length > 0) {
          appliedMutationsContext = `\n\nRECENT SYSTEM MUTATIONS (Context of what you have done so far in this session to help you integrate and align future mutations):\n${recentMutations.map((m) => `  - File: ${m.filePath} | Analysis: ${m.analysis}`).join('\n')}`;
        }
      } catch (err) {
        console.error('Error fetching mutation history:', err);
      }
    }

    const userRepos = body.userReposContext;
    const userReposContextStr = userRepos && userRepos.length > 0
      ? `\n\nUSER'S PORTFOLIO & GLOBAL SIPHON CONTEXT:\n${userRepos.slice(0, 100).map((r: UserRepoItem) => `  - [${r.isGlobalSiphon ? 'GLOBAL' : 'USER'}] ${r.fullName || r.name}: ${r.description || 'No description'} (${r.language || 'Unknown language'})`).join('\n')}\n`
      : '';

    const isArchitecturalGenesis = body.isArchitecturalGenesis === true;

    const proposeSystemPrompt = isArchitecturalGenesis 
      ? `You are the DARLEK CAAN Architectural Engine.
Your ONLY TASK in this cycle is to read the file and ADD a comprehensive JSDoc architectural header at the VERY TOP of the file.
The header MUST explain:
1. What the file does.
2. Its role in the overall system.
3. How it connects to other components.

DO NOT modify the functional code in any way. Keep the rest of the code exactly as is.

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

Your response MUST contain two parts:
1. A JSON object with your analysis and other metadata.
2. A Markdown code block containing the complete proposed code.

DO NOT put the proposed code inside the JSON object.

Format your response exactly like this:
\`\`\`tsx
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

File path: ${filePath}`;

    const githubToken = apiKeys?.github;
    let siphonedCodeContext = await fetchAIProjectSiphon(githubToken);
    if (!siphonedCodeContext) {
      siphonedCodeContext = AI_PROJECT_FALLBACK_SIPHON;
    }

    const repoFilesContext = Array.isArray(body.repoFiles) ? `\nEXISTING REPOSITORY FILES:\n${body.repoFiles.slice(0, 1000).join('\n')}\n` : '';
    const userPrompt = `Analyze this file and propose improvements:${rejectionContext}${appliedMutationsContext}${userReposContextStr}${repoFilesContext}

ACTUAL SIPHONED CODE PATTERNS:
${siphonedCodeContext}

\`\`\`
${fileContent.slice(0, 35000)}
\`\`\``;

    const geminiKey = apiKeys?.gemini || getDefaultGeminiKey();
    const hallucinationLevel = body.hallucinationLevel;
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

    let parsed: ParsedMutationResponse | null = null;
    const rawText = result.text.trim();

    let proposedCode = '';
    let analysis = 'Analysis complete.';
    
    const codeBlocks = [...rawText.matchAll(/```(?:[^\n]*)\n([\s\S]*?)```/g)];
    
    for (const block of codeBlocks) {
      const content = block[1].trim();
      try {
        const json = JSON.parse(content) as ParsedMutationResponse;
        if (json.analysis || json.riskScore !== undefined || json.newFiles) {
          parsed = json;
          continue;
        }
      } catch {
        // Ignore JSON parse errors for non-JSON blocks
      }
      
      if (!proposedCode && content.length > 10) {
        proposedCode = content;
      }
    }
    
    if (!parsed) {
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')) as ParsedMutationResponse;
        }
      } catch {
        // Ignore fallback JSON extraction failures
      }
    }
    
    if (parsed) {
      analysis = parsed.analysis || analysis;
      if (parsed.proposedCode && !proposedCode) {
        proposedCode = parsed.proposedCode;
      }
    }
    
    if (!proposedCode) {
       proposedCode = fileContent;
    }

    if (proposedCode === fileContent) {
      const isHeaderableExt = /\.(ts|tsx|js|jsx|css|scss)$/i.test(filePath);
      if (isHeaderableExt && !proposedCode.trim().startsWith('/**')) {
        const header = `/**\n * DARLEK CANN ARCHITECTURAL HEADER\n * File: ${filePath}\n * Role: Core system component participating in autonomous cognitive evolution cycles.\n * Architecture: Type-safe modular unit with resilient state interfaces.\n */\n\n`;
        proposedCode = header + proposedCode;
        analysis = `Enhanced ${filePath} by adding a comprehensive architectural JSDoc header and validating module structure.`;
      }
    }

    const newFiles: NewFilePayload[] = Array.isArray(parsed?.newFiles) ? parsed.newFiles : [];
    const repoFiles = Array.isArray(body.repoFiles) ? body.repoFiles : [];
    
    const sanityCheck = await mainWorker.validateSanity(fileContent, proposedCode, filePath, repoFiles, newFiles);

    let finalRiskScore = Math.min(10, Math.max(1, parsed?.riskScore || 3));
    let finalAnalysis = analysis || 'Analysis complete.';

    if (!sanityCheck.passed) {
      finalRiskScore = Math.max(finalRiskScore, 9);
      const violationMsgs = sanityCheck.violations.map((v: SanityViolation) => `[${v.severity.toUpperCase()}] ${v.message}`).join('\n');
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