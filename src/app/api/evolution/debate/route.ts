import { NextRequest, NextResponse } from 'next/server';
import { callLlm, getDefaultGeminiKey } from '@/lib/llm-provider';
import { db } from '@/lib/db';
import { dalekBrainDebateVote, dalekBrainSynthesize } from '@/lib/dalek-brain';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

// Type Definitions
interface AgentPersona {
  id: string;
  name: string;
  role: string;
  bias: string;
}

interface StructuralProposal {
  newPath?: string;
  type?: 'move' | 'create';
  branch?: string;
}

interface AgentVote {
  agentId: string;
  agentName: string;
  vote: 'approve' | 'reject' | 'abstain';
  confidence: number;
  reasoning: string;
  provider: string;
  structuralProposal?: StructuralProposal | null;
}

interface DebateBody {
  filePath?: string;
  originalCode?: string;
  proposedCode?: string;
  riskScore?: number;
  analysis?: string;
  affectedFiles?: string[];
  apiKeys?: Record<string, string>;
  rounds?: number;
  activeAgents?: string[];
  owner?: string;
  repo?: string;
  branch?: string;
  sessionId?: string;
  isArchitecturalGenesis?: boolean;
  hallucinationLevel?: number;
}

// GitHub Tree Fetcher with Robust Error Suppression
async function getFileTree(token: string, owner: string, repo: string, branch: string): Promise<string[]> {
  if (!token || !owner || !repo || !branch) return [];
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'EMG-Neural-Engine'
      },
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      const data = await res.json() as { tree?: { path: string }[] };
      return Array.isArray(data?.tree) ? data.tree.map((file) => file.path) : [];
    }
    return [];
  } catch {
    return [];
  }
}

async function fetchGithubFile(token: string, owner: string, repo: string, branch: string, path: string): Promise<string | null> {
  if (!token || !owner || !repo || !branch || !path) return null;
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3.raw',
        'User-Agent': 'EMG-Neural-Engine'
      },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Agent Personas Matrix
const AGENT_PERSONAS: AgentPersona[] = [
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

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'online', service: 'EVOLUTION_DEBATE_API' });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await safeReqJson<DebateBody>(req, {});
    const filePath = body.filePath || '';
    const originalCode = body.originalCode || '';
    const proposedCode = body.proposedCode || '';
    const riskScore = typeof body.riskScore === 'number' ? body.riskScore : 5;
    const analysis = body.analysis || 'Evolutionary delta inspection';
    const affectedFiles = Array.isArray(body.affectedFiles) ? body.affectedFiles : [];
    const apiKeys = body.apiKeys || {};
    const rounds = typeof body.rounds === 'number' ? body.rounds : 1;
    const sessionId = body.sessionId;
    const isArchitecturalGenesis = body.isArchitecturalGenesis === true;

    if (!filePath || !proposedCode || !originalCode) {
      return NextResponse.json({ error: 'filePath, originalCode, and proposedCode required.' }, { status: 400 });
    }

    const maxCodeLen = 35000;
    const truncatedOriginal = originalCode.length > maxCodeLen
      ? originalCode.slice(0, maxCodeLen) + '\n// ... [truncated]'
      : originalCode;

    const originalLines = originalCode.split('\n').length;
    const proposedLines = proposedCode.split('\n').length;
    const diffSummary = `File: ${filePath}\nRisk Score: ${riskScore}/10\nAnalysis: ${analysis}\nAffected Files: ${affectedFiles.join(', ') || 'None'}\nOriginal: ${originalLines} lines\nProposed: ${proposedLines} lines\nLine change: ${proposedLines - originalLines >= 0 ? '+' : ''}${proposedLines - originalLines} lines`;

    const githubToken = apiKeys.github || '';
    const repoOwner = body.owner || 'unknown';
    const repoName = body.repo || 'unknown';
    const repoBranch = body.branch || 'main';

    // Parallel IO fetching for file tree & README & mutations
    const [fileTree, readmeContent, recentMutations] = await Promise.all([
      getFileTree(githubToken, repoOwner, repoName, repoBranch),
      fetchGithubFile(githubToken, repoOwner, repoName, repoBranch, 'README.md'),
      sessionId ? db.mutationHistory.findMany({
        where: { sessionId, status: 'applied' },
        orderBy: { createdAt: 'desc' },
        take: 5
      }).catch(() => []) : Promise.resolve([])
    ]);

    const fileTreeSummary = fileTree.join('\n');
    let readmeContext = readmeContent ? `\n\nTARGET REPOSITORY SYSTEM INSTRUCTIONS (README.md):\n${readmeContent.slice(0, 3000)}` : '';
    let appliedMutationsContext = (recentMutations && recentMutations.length > 0)
      ? `\n\nRECENT SYSTEM MUTATIONS (Context of what you have done so far in this session):\n${recentMutations.map(m => `  - File: ${m.filePath} | Analysis: ${m.analysis}`).join('\n')}`
      : '';

    const effectiveRounds = Math.min(Math.max(1, rounds), 100);

    let currentVotes: AgentVote[] = [];
    let currentProposedCode = proposedCode;
    let didEnhance = false;

    for (let r = 1; r <= effectiveRounds; r++) {
      const truncatedProposed = currentProposedCode.length > maxCodeLen
        ? currentProposedCode.slice(0, maxCodeLen) + '\n// ... [truncated]'
        : currentProposedCode;

      const activeAgentIds = body.activeAgents;
      let selectedPersonas = Array.isArray(activeAgentIds) && activeAgentIds.length > 0
        ? AGENT_PERSONAS.filter(a => activeAgentIds.includes(a.id))
        : AGENT_PERSONAS;
      if (selectedPersonas.length === 0) {
        selectedPersonas = AGENT_PERSONAS;
      }

      if (r === 1) {
        const agentPromises = selectedPersonas.map(async (agent): Promise<AgentVote> => {
          const userPrompt = `MUTATION UNDER REVIEW:\n${diffSummary}${readmeContext}${appliedMutationsContext}\n\nREPOSITORY STRUCTURE:\n${fileTreeSummary}\n\nORIGINAL CODE:\n\`\`\`\n${truncatedOriginal}\n\`\`\`\n\nPROPOSED CODE:\n\`\`\`\n${truncatedProposed}\n\`\`\`\n\nEvaluate this mutation from your perspective as ${agent.name}. ${agent.bias}.\n\nIf you believe the file should be moved to a different folder, a new file/folder should be created, or changes pushed to a new branch, you MUST specify a JSON object for "structuralProposal" with {"newPath": "path/to/file.ext", "type": "move" or "create", "branch": "optional-branch"}. Otherwise omit "structuralProposal".\n\nRespond ONLY in this exact JSON format (no markdown fences, no other text):\n{"vote": "approve" | "reject" | "abstain", "confidence": <0-100>, "reasoning": "One sentence explaining your vote", "structuralProposal": {"newPath": "...", "type": "move|create", "branch": "..."}}`;

          const genesisDirective = isArchitecturalGenesis 
            ? `\nTHIS IS AN ARCHITECTURAL GENESIS CYCLE. Your ONLY focus is verifying the existence and quality of the JSDoc architectural header at the top of the file. You MUST APPROVE immediately if a good header is present.`
            : `\nCRITICAL MANDATE: Be constructive, evolutionary, and pragmatic. Do NOT default to rejecting. Approve improvements that are clean, readable, well-type-checked, and reasonably risk-mitigated.`;

          const systemPrompt = `[ROLE] You are a debate agent in the AHI Synthesis Loop.\n[PROFILE] ${agent.role}\n[OUTPUT FORMAT] Respond with PURE JSON ONLY. No markdown fences, no preamble.\n{\n  "vote": "approve" | "reject" | "abstain",\n  "confidence": 0-100,\n  "reasoning": "1-2 concise sentences.",\n  "structuralProposal": {"newPath": "...", "type": "move|create", "branch": "..."}\n}\n${genesisDirective}`;

          const result = await callLlm({
            systemPrompt,
            userPrompt,
            geminiApiKey: apiKeys.gemini || getDefaultGeminiKey(),
            maxTokens: 512,
            temperature: typeof body.hallucinationLevel === 'number' ? body.hallucinationLevel / 100 : 0.6,
          });

          let vote: 'approve' | 'reject' | 'abstain' = 'abstain';
          let confidence = 50;
          let reasoning = `${agent.name} could not reach a verdict (LLM unavailable).`;
          let structuralProposal: StructuralProposal | null = null;

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
              
              const match = reasoning.match(/\{"newPath"\s*:\s*"[^"]*",\s*"type"\s*:\s*"[^"]*"(?:,\s*"branch"\s*:\s*"[^"]*")?\s*\}/);
              if (match) {
                try { structuralProposal = JSON.parse(match[0]); } catch {}
              }
            }
          }

          if (vote === 'abstain' && confidence === 50 && reasoning.includes('LLM unavailable')) {
            const fallbackVote = dalekBrainDebateVote(agent.id, agent.name, filePath || 'module.ts', originalCode, currentProposedCode, 3);
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
          };
        });

        currentVotes = await Promise.all(agentPromises);
      } else {
        const transcript = currentVotes.map(v => `- ${v.agentName} voted [${v.vote.toUpperCase()}] (${v.confidence}% confidence) stating: "${v.reasoning}"`).join('\n');
        
        const agentPromises = selectedPersonas.map(async (agent): Promise<AgentVote> => {
          const userPrompt = `MUTATION UNDER REVIEW:\n${diffSummary}${readmeContext}${appliedMutationsContext}\n\nORIGINAL CODE:\n\`\`\`\n${truncatedOriginal}\n\`\`\`\n\nPROPOSED CODE:\n\`\`\`\n${truncatedProposed}\n\`\`\`\n\n--- PRIOR DEBATE ROUND DISCUSSION ---\n${transcript}\n\nAs ${agent.name}, review code and arguments. Revise your vote/reasoning.\n\nRespond in exact JSON format (no markdown):\n{"vote": "approve" | "reject" | "abstain", "confidence": 0-100, "reasoning": "One updated sentence"}`;
          
          const systemPrompt = `[ROLE] You are a debate agent in AHI Synthesis Loop.\n[PROFILE] ${agent.role}\n[OUTPUT FORMAT] Pure JSON only.\n{\n  "vote": "approve" | "reject" | "abstain",\n  "confidence": 0-100,\n  "reasoning": "1-2 sentences"\n}`;

          const result = await callLlm({
            systemPrompt,
            userPrompt,
            geminiApiKey: apiKeys.gemini || getDefaultGeminiKey(),
            maxTokens: 512,
            temperature: typeof body.hallucinationLevel === 'number' ? body.hallucinationLevel / 100 : 0.6,
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
            const fallbackVote = dalekBrainDebateVote(agent.id, agent.name, filePath || 'module.ts', originalCode, currentProposedCode, 3);
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
          };
        });

        currentVotes = await Promise.all(agentPromises);
      }

      const roundRejections = currentVotes.filter(v => v.vote === 'reject').length;
      const roundAbstains = currentVotes.filter(v => v.vote === 'abstain').length;

      if (roundRejections === 0 && roundAbstains === 0 && currentVotes.every(v => v.vote === 'approve')) {
        break;
      }

      if (r < effectiveRounds && (roundRejections > 0 || roundAbstains > 0)) {
        const transcript = currentVotes.map(v => `- ${v.agentName} voted [${v.vote.toUpperCase()}] (${v.confidence}% confidence) stating: "${v.reasoning}"`).join('\n');
        const synthesizeDirective = isArchitecturalGenesis 
          ? `Rewrite the PROPOSED CODE to fix structural concerns regarding headers.`
          : `Enhance and rewrite the PROPOSED CODE fixing all critic concerns. Prune dead weight and redundant abstractions.`;

        const synthesizePrompt = `[TASK] Merge approved logic into target stub. Fix live bugs.\n${synthesizeDirective}\n\nORIGINAL CODE:\n\`\`\`\n${truncatedOriginal}\n\`\`\`\n\nCURRENT PROPOSED:\n\`\`\`\n${truncatedProposed}\n\`\`\`\n\nDEBATE CRITIQUES:\n${transcript}\n\n[OUTPUT FORMAT] Raw executable code only. No markdown fences.`;

        try {
          const synthResult = await callLlm({
            systemPrompt: "[ROLE] AHI CODE SYNTHESIZER. Output raw executable code only without markdown wrappers.",
            userPrompt: synthesizePrompt,
            geminiApiKey: apiKeys.gemini || getDefaultGeminiKey(),
            maxTokens: 8000,
            temperature: 0.2,
          });

          if (synthResult.text && synthResult.text.trim().length > 10) {
            let enhanced = synthResult.text.trim();
            if (enhanced.startsWith('```')) {
              const lines = enhanced.split('\n');
              lines.shift();
              if (lines[lines.length - 1]?.startsWith('```')) {
                lines.pop();
              }
              enhanced = lines.join('\n');
            }
            currentProposedCode = enhanced;
            didEnhance = true;
          } else {
            const localEnhanced = dalekBrainSynthesize(truncatedOriginal, currentProposedCode, filePath || 'module.ts');
            if (localEnhanced && localEnhanced !== currentProposedCode) {
              currentProposedCode = localEnhanced;
              didEnhance = true;
            }
          }
        } catch {
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

    const totalWeights = votes.reduce((acc, v) => acc + (v.vote !== 'abstain' ? v.confidence : 0), 0);
    const positiveWeights = votes.reduce((acc, v) => acc + (v.vote === 'approve' ? v.confidence : 0), 0);
    const consensusCoefficient = totalWeights > 0 ? positiveWeights / totalWeights : 0.5;
    const cognitiveFriction = 1.0 - Math.abs(approvals - rejections) / Math.max(1, approvals + rejections);

    let epistemicRuling = `The swarm has deliberated. Simple consensus achieved: ${consensus}.`;
    try {
      const transcript = votes.map(v => `- ${v.agentName} (${v.vote.toUpperCase()}, confidence: ${v.confidence}%): "${v.reasoning}"`).join('\n');
      const rulingPrompt = `[TASK] Review synthesis debate and output a 1-2 sentence Epistemological Ruling in strict plain text.\n\nTRANSCRIPT:\n${transcript}`;

      const rulingResult = await callLlm({
        systemPrompt: '[ROLE] AHI HEGELIAN SYNTHESIZER. Pure plain text only.',
        userPrompt: rulingPrompt,
        geminiApiKey: apiKeys.gemini || getDefaultGeminiKey(),
        maxTokens: 256,
        temperature: 0.3,
      });

      if (rulingResult.text) {
        epistemicRuling = rulingResult.text.trim().replace(/^"|"$/g, '');
      }
    } catch {}

    let structuralProposal: StructuralProposal | null = null;
    for (const v of votes.filter(v => v.vote === 'approve')) {
      if (v.structuralProposal?.newPath) {
        structuralProposal = v.structuralProposal;
        break;
      }
      try {
        const match = v.reasoning.match(/\{"newPath"\s*:\s*"[^"]*",\s*"type"\s*:\s*"[^"]*"(?:,\s*"branch"\s*:\s*"[^"]*")?\s*\}/);
        if (match) {
          structuralProposal = JSON.parse(match[0]);
          break;
        }
      } catch {}
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}