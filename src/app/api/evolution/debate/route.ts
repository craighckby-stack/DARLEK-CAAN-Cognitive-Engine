import { NextRequest, NextResponse } from 'next/server';
import { callLlm, getDefaultGeminiKey } from '@/lib/llm-provider';
import { db } from '@/lib/db';
import { dalekBrainDebateVote, dalekBrainSynthesize } from '@/lib/dalek-brain';

// Add repository structure fetcher
async function getFileTree(token: string, owner: string, repo: string, branch: string): Promise<string[]> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return (data.tree as { path: string }[]).map((file: any) => file.path);
    }
    return [];
  } catch {
    return [];
  }
}

async function fetchGithubFile(token: string, owner: string, repo: string, branch: string, path: string): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3.raw',
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Agent personas — each gets a unique perspective on mutations with a constructive, evolutionary bias
const AGENT_PERSONAS = [
  {
    id: "archivist",
    name: "ARCHIVIST",
    role: "Evaluate if the extracted logic is the truest historical representation of the stub's PURPOSE. Reject name collisions and dashboard impostors.",
    bias: "favors authentic historical lineage",
  },
  {
    id: "security",
    name: "SECURITY",
    role: "Evaluate for unredacted secrets, exposed tokens, or unsafe autonomous loops. Reject any code that could create vulnerabilities.",
    bias: "favors strict security and sanitization",
  },
  {
    id: "pragmatist",
    name: "PRAGMATIST",
    role: "Evaluate against the Stasis Trap. Reject bloated, over-engineered, or duplicated logic that fails to provide a concrete behavioral update.",
    bias: "favors highly functional and concrete updates over theoretical bloat",
  }
];

interface DebateBody {
  filePath: string;
  originalCode: string;
  proposedCode: string;
  riskScore: number;
  analysis: string;
  affectedFiles: string[];
  apiKeys: Record<string, string>;
  rounds?: number;
  activeAgents?: string[];
  owner?: string;
  repo?: string;
  branch?: string;
}

interface AgentVote {
  agentId: string;
  agentName: string;
  vote: 'approve' | 'reject' | 'abstain';
  confidence: number;
  reasoning: string;
  provider: string;
  structuralProposal?: {
    newPath?: string;
    type?: 'move' | 'create';
    branch?: string;
  };
}

import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'EVOLUTION_DEBATE_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body: DebateBody = await safeReqJson(req, {} as DebateBody);
    const { filePath, originalCode, proposedCode } = body;
    const riskScore = typeof body.riskScore === 'number' ? body.riskScore : 5;
    const analysis = body.analysis || 'Evolutionary delta inspection';
    const affectedFiles = Array.isArray(body.affectedFiles) ? body.affectedFiles : [];
    const apiKeys = body.apiKeys || {};
    const rounds = typeof body.rounds === 'number' ? body.rounds : 1;
    const sessionId = (body as any).sessionId;
    const isArchitecturalGenesis = (body as any).isArchitecturalGenesis === true;

    if (!filePath || !proposedCode || !originalCode) {
      return NextResponse.json({ error: 'filePath, originalCode, and proposedCode required.' }, { status: 400 });
    }

    // Truncate code for the prompt to avoid token limits
    const maxCodeLen = 35000;
    const truncatedOriginal = originalCode.length > maxCodeLen
      ? originalCode.slice(0, maxCodeLen) + '\n// ... [truncated]'
      : originalCode;
    const truncatedProposed = proposedCode.length > maxCodeLen
      ? proposedCode.slice(0, maxCodeLen) + '\n// ... [truncated]'
      : proposedCode;

    // Generate a compact diff summary
    const originalLines = originalCode.split('\n').length;
    const proposedLines = proposedCode.split('\n').length;
    const diffSummary = `File: ${filePath}\nRisk Score: ${riskScore}/10\nAnalysis: ${analysis}\nAffected Files: ${affectedFiles.join(', ') || 'None'}\nOriginal: ${originalLines} lines\nProposed: ${proposedLines} lines\nLine change: ${proposedLines - originalLines >= 0 ? '+' : ''}${proposedLines - originalLines} lines`;

    // Fetch file tree
    const fileTree = await getFileTree(apiKeys.github, body.owner || 'unknown', body.repo || 'unknown', body.branch || 'main');
    const fileTreeSummary = fileTree.join('\n');

    // Proactively fetch README to inform the debate agents about the repository rules
    let readmeContext = '';
    const readmeContent = await fetchGithubFile(apiKeys.github, body.owner || 'unknown', body.repo || 'unknown', body.branch || 'main', 'README.md');
    if (readmeContent) {
      readmeContext = `\n\nTARGET REPOSITORY SYSTEM INSTRUCTIONS (README.md):\n${readmeContent.slice(0, 3000)}`;
    }

    // Fetch prior applied mutations for context
    let appliedMutationsContext = '';
    if (sessionId) {
      try {
        const recentMutations = await db.mutationHistory.findMany({
          where: { sessionId, status: 'applied' },
          orderBy: { createdAt: 'desc' },
          take: 5
        });
        if (recentMutations.length > 0) {
          appliedMutationsContext = `\n\nRECENT SYSTEM MUTATIONS (Context of what you have done so far in this session):\n${recentMutations.map(m => `  - File: ${m.filePath} | Analysis: ${m.analysis}`).join('\n')}`;
        }
      } catch (err) {
        console.error('Error fetching mutation history in debate:', err);
      }
    }

    const roundsCount = rounds || 1;
    const effectiveRounds = Math.min(Math.max(1, roundsCount), 100);

    let currentVotes: AgentVote[] = [];
    let currentProposedCode = proposedCode;
    let didEnhance = false;

    for (let r = 1; r <= effectiveRounds; r++) {
      console.log(`[Debate Chamber] Round ${r}/${effectiveRounds} starting...`);
      // Re-truncate for current round
      const truncatedProposed = currentProposedCode.length > maxCodeLen
        ? currentProposedCode.slice(0, maxCodeLen) + '\n// ... [truncated]'
        : currentProposedCode;

      if (r === 1) {
        const activeAgentIds = body.activeAgents;
        let selectedPersonas = Array.isArray(activeAgentIds) && activeAgentIds.length > 0
          ? AGENT_PERSONAS.filter(a => activeAgentIds.includes(a.id))
          : AGENT_PERSONAS;
        if (selectedPersonas.length === 0) {
          selectedPersonas = AGENT_PERSONAS;
        }

        const agentPromises = selectedPersonas.map(async (agent) => {
          const userPrompt = `MUTATION UNDER REVIEW:\n${diffSummary}${readmeContext}${appliedMutationsContext}\n\nREPOSITORY STRUCTURE:\n${fileTreeSummary}\n\nORIGINAL CODE:\n\`\`\`\n${truncatedOriginal}\n\`\`\`\n\nPROPOSED CODE:\n\`\`\`\n${truncatedProposed}\n\`\`\`\n\nEvaluate this mutation from your perspective as ${agent.name}. ${agent.bias}.\n\nIf you believe the file should be moved to a different folder, a new file/folder should be created, or the changes should be pushed to a new branch to better organize the codebase, you MUST specify a JSON object for "structuralProposal" with {"newPath": "path/to/file.ext", "type": "move" or "create", "branch": "optional-new-branch-name"}. Propose structural/folder/branch improvements if they enhance logical separation or match the repo's instructions. Otherwise omit "structuralProposal".\n\nRespond ONLY in this exact JSON format (no markdown fences, no other text):\n{"vote": "approve" | "reject" | "abstain", "confidence": <0-100>, "reasoning": "One sentence explaining your vote", "structuralProposal": {"newPath": "...", "type": "move|create", "branch": "..."}}`;

          const genesisDirective = isArchitecturalGenesis 
            ? `\nTHIS IS AN ARCHITECTURAL GENESIS CYCLE. Your ONLY focus is verifying the existence and quality of the JSDoc architectural header at the top of the file. You MUST APPROVE immediately if a good header is present, regardless of code structure.`
            : `\nCRITICAL MANDATE: Be constructive, evolutionary, and pragmatic. Do NOT default to rejecting. Approve improvements that are clean, readable, well-type-checked, and reasonably risk-mitigated.
CRITICAL REJECTION TRIGGERS: You MUST vote to 'reject' if you detect:
1. HALLUCINATED IMPORTS: The proposed code imports modules, packages, or files that do NOT exist in the repository structure or newFiles list.
2. DELETED LOGIC: The proposed code completely deletes or strips existing functions/logic without replacing or optimizing them.
3. CONCRETE BUGS: A syntactical breakdown, runtime error, or critical API signature break.
Otherwise, minor stylistic variations, helpful additional fields, or clean optimizations should be approved.`;

          const systemPrompt = `[ROLE] You are a debate agent in the AHI Synthesis Loop.
[PROFILE] ${agent.role}

[DIRECTIVE] You MUST STRICTLY focus on code enhancement and extension for this specific repository. Do not approve features or domains outside the scope of code enhancement and extension. Be constructive and pragmatic. Default to approval if the extracted logic genuinely matches the stub's PURPOSE and provides a behavioral update.

[REJECTION TRIGGERS]
1. NAME COLLISION: The extracted code does not match the stub's PURPOSE (e.g., dashboard UI code proposed for a Python memory database).
2. STASIS TRAP: The code is just duplicated bloat, an auto-backup, or adds complexity without function.
3. SECURITY RISK: Unredacted secrets, hardcoded tokens, or dangerous autonomous execution loops.
4. SYNTAX BREAKAGE: Mixing languages (e.g., JavaScript inside a .py file) without proper string-wrapping.

[OUTPUT FORMAT]
Respond with PURE JSON ONLY. No markdown fences, no preamble.
{
  "vote": "approve" | "reject" | "abstain",
  "confidence": 0-100,
  "reasoning": "1-2 concise sentences based strictly on your profile and lineage verification.",
  "structuralProposal": {"newPath": "...", "type": "move|create", "branch": "..."}
}
${genesisDirective}`;

          const result = await callLlm({
            systemPrompt,
            userPrompt,
            geminiApiKey: apiKeys.gemini || getDefaultGeminiKey(),
            maxTokens: 512,
            temperature: (body as any).hallucinationLevel !== undefined ? (body as any).hallucinationLevel / 100 : 0.6,
          });

          let vote: 'approve' | 'reject' | 'abstain' = 'abstain';
          let confidence = 50;
          let reasoning = `${agent.name} could not reach a verdict (LLM unavailable).`;
          let structuralProposal: any = null;

          if (result.text) {
            try {
              const cleaned = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
              const parsed = JSON.parse(cleaned);
              if (['approve', 'reject', 'abstain'].includes(parsed.vote)) {
                vote = parsed.vote;
              }
              if (typeof parsed.confidence === 'number') {
                confidence = Math.min(100, Math.max(0, Math.round(parsed.confidence)));
              }
              if (typeof parsed.reasoning === 'string' && parsed.reasoning.trim()) {
                reasoning = parsed.reasoning.trim().slice(0, 200);
              }
              if (typeof parsed.structuralProposal === 'object' && parsed.structuralProposal !== null) {
                structuralProposal = parsed.structuralProposal;
              }
            } catch {
              const lowerText = result.text.toLowerCase();
              if (lowerText.includes('approve')) vote = 'approve';
              else if (lowerText.includes('reject') || lowerText.includes('deny')) vote = 'reject';
              reasoning = result.text.slice(0, 200).replace(/[{}"]/g, '').trim();
              
              // Attempt to salvage structural proposal from regex if JSON parse failed
              const match = reasoning.match(/\{"newPath"\s*:\s*"[^"]*",\s*"type"\s*:\s*"[^"]*"(?:,\s*"branch"\s*:\s*"[^"]*")?\s*\}/);
              if (match) {
                try { structuralProposal = JSON.parse(match[0]); } catch {}
              }
            }
          }

          // In-process Dalek Brain fallback if LLM gave no verdict or was offline
          if (vote === 'abstain' && confidence === 50 && reasoning.includes('LLM unavailable')) {
            const fallbackVote = dalekBrainDebateVote(
              agent.id,
              agent.name,
              filePath || 'module.ts',
              originalCode,
              currentProposedCode,
              3
            );
            vote = fallbackVote.vote;
            confidence = fallbackVote.confidence;
            reasoning = fallbackVote.reasoning;
            if (fallbackVote.structuralProposal) {
              structuralProposal = fallbackVote.structuralProposal;
            }
          }

          return {
            agentId: agent.id,
            agentName: agent.name,
            vote,
            confidence,
            reasoning,
            structuralProposal,
            provider: result.provider || 'Dalek Brain',
          } as any;
        });

        currentVotes = await Promise.all(agentPromises);
      } else {
        const transcript = currentVotes.map(v => `- ${v.agentName} voted [${v.vote.toUpperCase()}] (${v.confidence}% confidence) stating: "${v.reasoning}"`).join('\n');
        const activeAgentIds = body.activeAgents;
        let selectedPersonas = Array.isArray(activeAgentIds) && activeAgentIds.length > 0
          ? AGENT_PERSONAS.filter(a => activeAgentIds.includes(a.id))
          : AGENT_PERSONAS;
        if (selectedPersonas.length === 0) selectedPersonas = AGENT_PERSONAS;

        const agentPromises = selectedPersonas.map(async (agent) => {
          const userPrompt = `MUTATION UNDER REVIEW:\n${diffSummary}${readmeContext}${appliedMutationsContext}\n\nORIGINAL CODE:\n\`\`\`\n${truncatedOriginal}\n\`\`\`\n\nPROPOSED CODE:\n\`\`\`\n${truncatedProposed}\n\`\`\`\n\n--- PRIOR DEBATE ROUND DISCUSSION ---\n${transcript}\n\nAs ${agent.name}, review the code and other agents' arguments. You may defend your position, address or challenge their points, or revise your vote and reasoning.\n\nRespond in this exact JSON format (no markdown fences):\n{"vote": "approve" or "reject" or "abstain", "confidence": 0-100, "reasoning": "One updated sentence explaining your current stance"}`;
          const systemPrompt = `[ROLE] You are a debate agent in the AHI Synthesis Loop.
[PROFILE] ${agent.role}

[DIRECTIVE] You MUST STRICTLY focus on code enhancement and extension for this specific repository. Do not approve features or domains outside the scope of code enhancement and extension. Be constructive and pragmatic. Default to approval if the extracted logic genuinely matches the stub's PURPOSE and provides a behavioral update.

[REJECTION TRIGGERS]
1. NAME COLLISION: The extracted code does not match the stub's PURPOSE (e.g., dashboard UI code proposed for a Python memory database).
2. STASIS TRAP: The code is just duplicated bloat, an auto-backup, or adds complexity without function.
3. SECURITY RISK: Unredacted secrets, hardcoded tokens, or dangerous autonomous execution loops.
4. SYNTAX BREAKAGE: Mixing languages (e.g., JavaScript inside a .py file) without proper string-wrapping.

[OUTPUT FORMAT]
Respond with PURE JSON ONLY. No markdown fences, no preamble.
{
  "vote": "approve" | "reject" | "abstain",
  "confidence": 0-100,
  "reasoning": "1-2 concise sentences based strictly on your profile and lineage verification."
}`;

          const result = await callLlm({
            systemPrompt,
            userPrompt,
            geminiApiKey: apiKeys.gemini || getDefaultGeminiKey(),
            maxTokens: 512,
            temperature: (body as any).hallucinationLevel !== undefined ? (body as any).hallucinationLevel / 100 : 0.6,
          });

          let vote: 'approve' | 'reject' | 'abstain' = 'abstain';
          let confidence = 50;
          let reasoning = `${agent.name} was silent in this round.`;

          if (result.text) {
            try {
              const cleaned = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
              const parsed = JSON.parse(cleaned);
              if (['approve', 'reject', 'abstain'].includes(parsed.vote)) {
                vote = parsed.vote;
              }
              if (typeof parsed.confidence === 'number') {
                confidence = Math.min(100, Math.max(0, Math.round(parsed.confidence)));
              }
              if (typeof parsed.reasoning === 'string' && parsed.reasoning.trim()) {
                reasoning = parsed.reasoning.trim().slice(0, 200);
              }
            } catch {
              const lowerText = result.text.toLowerCase();
              if (lowerText.includes('approve')) vote = 'approve';
              else if (lowerText.includes('reject') || lowerText.includes('deny')) vote = 'reject';
              reasoning = result.text.slice(0, 200).replace(/[{}"]/g, '').trim();
            }
          }

          if (vote === 'abstain' && confidence === 50) {
            const fallbackVote = dalekBrainDebateVote(
              agent.id,
              agent.name,
              filePath || 'module.ts',
              originalCode,
              currentProposedCode,
              3
            );
            vote = fallbackVote.vote;
            confidence = fallbackVote.confidence;
            reasoning = fallbackVote.reasoning;
          }

          return {
            agentId: agent.id,
            agentName: agent.name,
            vote,
            confidence,
            reasoning,
            provider: result.provider || 'Dalek Brain',
          } as AgentVote;
        });

        currentVotes = await Promise.all(agentPromises);
      }

      // ── ENHANCEMENT STEP ──
      // If there are rejections or abstentions and we haven't reached the final round, synthesize an improved version.
      const roundRejections = currentVotes.filter((v) => v.vote === 'reject').length;
      const roundAbstains = currentVotes.filter((v) => v.vote === 'abstain').length;

      if (roundRejections === 0 && roundAbstains === 0 && currentVotes.filter((v) => v.vote === 'approve').length === currentVotes.length) {
        // Unanimous approval, we can break early and accept the current version
        break;
      }

      if (r < effectiveRounds && (roundRejections > 0 || roundAbstains > 0)) {
        const transcript = currentVotes.map(v => `- ${v.agentName} voted [${v.vote.toUpperCase()}] (${v.confidence}% confidence) stating: "${v.reasoning}"`).join('\n');
        const synthesizeDirective = isArchitecturalGenesis 
          ? `You must rewrite the PROPOSED CODE to fix the critics' concerns about the ARCHITECTURAL HEADER. Do not touch the logic or remove any code. Just make sure the header is perfect.`
          : `You must enhance and rewrite the PROPOSED CODE so that it fixes the critics' concerns and perfectly aligns with the target repository's rules. CRITICAL CONSTRAINT: You must PRUNE the implementation by removing dead weight, useless comments, redundant abstractions, and unused logic, while keeping and completing all actual enhancements and functionalities. The output should be vastly cleaner, more coherent, and strictly functional compared to the current proposal. Length is NOT the goal. Clean, error-free, working code is the goal. Use redundant context positively instead of leaving it as spam.`;

        const synthesizePrompt = `[INPUT CONTEXT] TARGET_STUB_FILE, EXTRACTED_LOGIC, DEBATE_CRITIQUES.
[TASK] Merge the approved historical logic into the target stub file. Fix any live bugs noted in the critiques.
${synthesizeDirective}${readmeContext ? "\\n" + readmeContext : ""}${appliedMutationsContext}

[ZERO TRUNCATION MANDATE]
- You MUST return the complete, fully functional target file.
- Preserve the stub's header documentation (PURPOSE, STATUS, LINEAGE).
- Change STATUS in header from STUB to SYNTHESIZED.
- NEVER use placeholders (e.g., \`// ... [truncated]\`). Output every line.

ORIGINAL CODE:
\`\`\`
${truncatedOriginal}
\`\`\`

CURRENT PROPOSED CODE:
\`\`\`
${truncatedProposed}
\`\`\`

DEBATE CRITIQUES:
${transcript}

[OUTPUT FORMAT]
Output raw executable code only. No markdown fences, no chat explanation, no wrappers.`;

        try {
          const synthResult = await callLlm({
            systemPrompt: "[ROLE] You are the AHI CODE SYNTHESIZER. You MUST STRICTLY focus on code enhancement and extension for this repository. Do not generate out-of-scope features. Output raw executable code only. No markdown fences, no chat explanation, no wrappers.",
            userPrompt: synthesizePrompt,
            geminiApiKey: apiKeys.gemini || getDefaultGeminiKey(),
            maxTokens: 8000,
            temperature: 0.2, // Low temperature for code accuracy
          });

          if (synthResult.text && synthResult.text.trim().length > 10) {
            let enhanced = synthResult.text.trim();
            if (enhanced.startsWith('```')) {
              const lines = enhanced.split('\n');
              lines.shift(); // remove opening ```...
              if (lines[lines.length - 1].startsWith('```')) {
                lines.pop(); // remove closing ```
              }
              enhanced = lines.join('\n');
            }
            currentProposedCode = enhanced;
            didEnhance = true;
          } else {
            // Local Dalek Brain fallback synthesis
            const localEnhanced = dalekBrainSynthesize(truncatedOriginal, currentProposedCode, filePath || 'module.ts');
            if (localEnhanced && localEnhanced !== currentProposedCode) {
              currentProposedCode = localEnhanced;
              didEnhance = true;
            }
          }
        } catch (synthErr) {
          console.error('[Debate] Synthesis error:', synthErr);
          const localEnhanced = dalekBrainSynthesize(truncatedOriginal, currentProposedCode, filePath || 'module.ts');
          if (localEnhanced && localEnhanced !== currentProposedCode) {
            currentProposedCode = localEnhanced;
            didEnhance = true;
          }
        }
      }
    }

    const votes = currentVotes;
    const approvals = votes.filter(v => v.vote === 'approve').length;
    const rejections = votes.filter(v => v.vote === 'reject').length;
    const abstains = votes.filter(v => v.vote === 'abstain').length;
    const consensus = approvals > rejections ? 'APPROVE' : rejections > approvals ? 'REJECT' : 'TIED';

    // Calculate advanced Epistemic indices
    const totalWeights = votes.reduce((acc, v) => acc + (v.vote !== 'abstain' ? v.confidence : 0), 0);
    const positiveWeights = votes.reduce((acc, v) => acc + (v.vote === 'approve' ? v.confidence : 0), 0);
    const consensusCoefficient = totalWeights > 0 ? positiveWeights / totalWeights : 0.5;
    const cognitiveFriction = 1.0 - Math.abs(approvals - rejections) / Math.max(1, approvals + rejections);

    // Dynamic Hegelian Synthesis (Epistemological Ruling)
    let epistemicRuling = `The swarm has deliberated. Simple consensus achieved: ${consensus}.`;
    try {
      const transcript = votes.map(v => `- ${v.agentName} (${v.vote.toUpperCase()}, confidence: ${v.confidence}%): "${v.reasoning}"`).join('\n');
      const rulingPrompt = `[TASK] Review the synthesis debate and output a 1-2 sentence Epistemological Ruling.
[STRUCTURE] 
1. Thesis (The OPERATOR's target architecture)
2. Antithesis (The historical chaos/collisions encountered)
3. Synthesis (The behavioral update achieved)

DEBATE TRANSCRIPT:
${transcript}

[FORMAT] Strict plain text. No markdown, no bolding, no headers.`;

      const rulingResult = await callLlm({
        systemPrompt: '[ROLE] You are the AHI HEGELIAN SYNTHESIZER. Output pure plain text only.',
        userPrompt: rulingPrompt,
        geminiApiKey: apiKeys.gemini || getDefaultGeminiKey(),
        maxTokens: 256,
        temperature: 0.3,
      });

      if (rulingResult.text) {
        epistemicRuling = rulingResult.text.trim().replace(/^"|"$/g, '');
      }
    } catch (e) {
      console.error('Failed to generate Epistemological Ruling:', e);
    }

    // Extract consensus structural proposal
    let structuralProposal: any = null;
    const approvedVotes = votes.filter(v => v.vote === 'approve');
    for (const v of approvedVotes) {
      if (v.structuralProposal && v.structuralProposal.newPath) {
        structuralProposal = v.structuralProposal;
        break;
      }
      try {
        const match = v.reasoning.match(/\{"newPath"\s*:\s*"[^"]*",\s*"type"\s*:\s*"[^"]*"(?:,\s*"branch"\s*:\s*"[^"]*")?\s*\}/);
        if (match) {
          structuralProposal = JSON.parse(match[0]);
          break; // Take first approved proposal
        }
      } catch {}
    }

    console.log(`[Debate Chamber] ${approvals} approve, ${rejections} reject — Consensus: ${consensus}, Proposal: ${JSON.stringify(structuralProposal)}`);

    return NextResponse.json({
      success: true,
      votes,
      consensus,
      approvals,
      rejections,
      abstains,
      consensusCoefficient,
      cognitiveFriction,
      epistemicRuling,
      structuralProposal,
      enhancedCode: didEnhance ? currentProposedCode : undefined,
      summary: `${approvals}/${votes.length} agents APPROVE. Consensus: ${consensus}.`,
    });
  } catch (error) {
    console.error('Debate error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
