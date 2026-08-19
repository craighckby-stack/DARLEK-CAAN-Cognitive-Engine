import { NextRequest, NextResponse } from 'next/server';
import { callLlm, callLlmMultiTurn, getDefaultGeminiKey } from '@/lib/llm-provider';

// ─────────────────────────────────────────────
// Default agent configs (fallback if none provided)
// ─────────────────────────────────────────────

const DEFAULT_AGENTS = [
  {
    id: 'architect',
    name: 'ARCHITECT',
    color: '#00ffcc',
    icon: '◇',
    systemInstruction: `[ROLE] You are an Agent Orchestra member in the AHI framework.
[DIRECTIVE] Analyze the provided ENCYCLOPEDIA_JSON. Respond according to your assigned profile. Be direct, precise, and concise. No conversational padding.

[PROFILE] ARCHITECT
Identify which stubs have the strongest historical lineage and are ready for synthesis.`,
  },
  {
    id: 'disruptor',
    name: 'DISRUPTOR',
    color: '#cc00ff',
    icon: '◆',
    systemInstruction: `[ROLE] You are an Agent Orchestra member in the AHI framework.
[DIRECTIVE] Analyze the provided ENCYCLOPEDIA_JSON. Respond according to your assigned profile. Be direct, precise, and concise. No conversational padding.

[PROFILE] DISRUPTOR
Identify code signatures that completely contradict their repository names (impostors/collisions).`,
  },
  {
    id: 'realist',
    name: 'REALIST',
    color: '#ff2020',
    icon: '◈',
    systemInstruction: `[ROLE] You are an Agent Orchestra member in the AHI framework.
[DIRECTIVE] Analyze the provided ENCYCLOPEDIA_JSON. Respond according to your assigned profile. Be direct, precise, and concise. No conversational padding.

[PROFILE] REALIST
Identify which repositories are just backup noise and should be purged from the encyclopedia to save context space.`,
  },
];

// ─────────────────────────────────────────────
// Request types
// ─────────────────────────────────────────────

interface OrchestraRequestBody {
  mode: 'parallel' | 'debate';
  topic: string;
  rounds: number;
  apiKeys: Record<string, string>;
  agentConfigs?: Array<{
    id: string;
    name: string;
    color: string;
    icon: string;
    systemInstruction: string;
  }>;
}

interface AgentCallResult {
  agentId: string;
  agentName: string;
  response: string;
  provider: string;
  latencyMs: number;
  error: string | null;
}

// ─────────────────────────────────────────────
// POST Handler
// ─────────────────────────────────────────────

import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'EVOLUTION_ORCHESTRA_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body: OrchestraRequestBody = await safeReqJson(req, {} as OrchestraRequestBody);
    const mode = body.mode || 'parallel';
    const { topic, rounds = 1, apiKeys, agentConfigs } = body;

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json({ error: 'Topic is required (minimum 3 characters).' }, { status: 400 });
    }

    if (!['parallel', 'debate'].includes(mode)) {
      return NextResponse.json({ error: 'Mode must be "parallel" or "debate".' }, { status: 400 });
    }

    const agents = (agentConfigs && agentConfigs.length === 3 ? agentConfigs : DEFAULT_AGENTS) as typeof DEFAULT_AGENTS;
    const effectiveRounds = Math.min(Math.max(1, rounds), 100);
    const logs: Array<{
      timestamp: string;
      type: 'call' | 'response' | 'error' | 'info';
      agent?: string;
      provider?: string;
      message: string;
      latencyMs?: number;
    }> = [];

    const now = () => new Date().toISOString();

    // Gemini key: user-provided or env default
    const geminiKey = apiKeys?.gemini || getDefaultGeminiKey();

    logs.push({ timestamp: now(), type: 'info', message: `Orchestra started — mode: ${mode}, rounds: ${effectiveRounds}, topic: "${topic.slice(0, 60)}${topic.length > 60 ? '...' : ''}"` });

    if (mode === 'parallel') {
      // ── PARALLEL MODE: Fire all agents simultaneously ──
      const callAgent = async (agent: (typeof agents)[number]): Promise<AgentCallResult> => {
        logs.push({ timestamp: now(), type: 'call', agent: agent.name, message: `Initiating ${agent.name} analysis...` });

        const userPrompt = `Analyze the following topic from your unique perspective as ${agent.name}.\n\nTOPIC:\n${topic}\n\nProvide your analysis. Be specific, insightful, and substantive. Do not merely summarize — deliver genuine analytical value.`;
        const result = await callLlm({
          systemPrompt: agent.systemInstruction,
          userPrompt,
          geminiApiKey: geminiKey,
          maxTokens: 1024,
          temperature: 0.7,
        });

        if (result.text) {
          logs.push({
            timestamp: now(),
            type: 'response',
            agent: agent.name,
            provider: result.provider,
            message: `${agent.name} responded (${result.text.length} chars)`,
            latencyMs: result.latencyMs,
          });
          return {
            agentId: agent.id,
            agentName: agent.name,
            response: result.text,
            provider: result.provider,
            latencyMs: result.latencyMs || 0,
            error: null,
          };
        } else {
          logs.push({
            timestamp: now(),
            type: 'error',
            agent: agent.name,
            provider: result.provider,
            message: `${agent.name} — all LLM providers failed`,
            latencyMs: result.latencyMs,
          });
          return {
            agentId: agent.id,
            agentName: agent.name,
            response: '',
            provider: 'None',
            latencyMs: result.latencyMs || 0,
            error: 'All LLM providers unavailable.',
          };
        }
      };

      const results = await Promise.all(agents.map(callAgent));
      const totalLatency = results.reduce((sum, r) => sum + r.latencyMs, 0);

      logs.push({
        timestamp: now(),
        type: 'info',
        message: `Parallel complete — ${results.filter((r) => r.response).length}/3 agents responded, total latency: ${totalLatency}ms`,
      });

      return NextResponse.json({
        success: true,
        mode: 'parallel',
        topic,
        agents: results.map((r) => ({
          agentId: r.agentId,
          agentName: r.agentName,
          status: r.response ? 'responded' : 'error',
          response: r.response,
          provider: r.provider,
          timestamp: now(),
          latencyMs: r.latencyMs,
        })),
        logs,
        summary: `${results.filter((r) => r.response).length}/3 agents responded in parallel mode.`,
      });
    }

    // ── DEBATE MODE: Sequential multi-turn ──
    const debateTurns: Array<{
      round: number;
      responses: Array<{
        agentId: string;
        agentName: string;
        status: string;
        response: string;
        provider: string;
        timestamp: string;
        latencyMs: number;
      }>;
    }> = [];

    for (let round = 1; round <= effectiveRounds; round++) {
      logs.push({ timestamp: now(), type: 'info', message: `─── Debate Round ${round}/${effectiveRounds} ───` });

      const turnResponses: Array<{
        agentId: string;
        agentName: string;
        status: string;
        response: string;
        provider: string;
        timestamp: string;
        latencyMs: number;
      }> = [];

      for (const agent of agents) {
        logs.push({ timestamp: now(), type: 'call', agent: agent.name, message: `Round ${round} — ${agent.name} thinking...` });

        // Build multi-turn conversation contents for Gemini
        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        // Add previous rounds as conversation history
        for (const turn of debateTurns) {
          for (const resp of turn.responses) {
            if (resp.response) {
              contents.push({
                role: 'user',
                parts: [{ text: `[${resp.agentName}]: ${resp.response}` }],
              });
            }
          }
        }

        // Add current agent's prompt
        const currentPrompt =
          round === 1
            ? `Analyze the following topic from your unique perspective as ${agent.name}.\n\nTOPIC:\n${topic}\n\nProvide your analysis. Be specific, insightful, and substantive.`
            : `The orchestra is in debate mode, Round ${round}/${effectiveRounds}.\n\nORIGINAL TOPIC:\n${topic}\n\n--- YOUR TURN (${agent.name}, Round ${round}) ---\nReview the prior discussion. You may:\n- Build upon points you agree with\n- Challenge positions you disagree with\n- Introduce new perspectives or data\n- Synthesize the discussion toward consensus or highlight irreconcilable differences\n\nRespond as ${agent.name}. Be substantive and move the discussion forward.`;

        contents.push({ role: 'user', parts: [{ text: currentPrompt }] });

        let result;
        if (round === 1 && debateTurns.length === 0) {
          // Round 1: single-turn call
          result = await callLlm({
            systemPrompt: agent.systemInstruction,
            userPrompt: currentPrompt,
            geminiApiKey: geminiKey,
            maxTokens: 1024,
            temperature: 0.7,
          });
        } else {
          // Subsequent rounds: multi-turn
          result = await callLlmMultiTurn(agent.systemInstruction, contents, geminiKey, 1024);
        }

        turnResponses.push({
          agentId: agent.id,
          agentName: agent.name,
          status: result.text ? 'responded' : 'error',
          response: result.text || `[${agent.name} was unable to respond — LLM unavailable]`,
          provider: result.provider,
          timestamp: now(),
          latencyMs: result.latencyMs || 0,
        });

        logs.push({
          timestamp: now(),
          type: result.text ? 'response' : 'error',
          agent: agent.name,
          provider: result.provider,
          message: `${agent.name} round ${round}: ${result.text ? `${result.text.length} chars` : 'failed'}`,
          latencyMs: result.latencyMs,
        });
      }

      debateTurns.push({ round, responses: turnResponses });
    }

    logs.push({
      timestamp: now(),
      type: 'info',
      message: `Debate complete — ${effectiveRounds} rounds, ${debateTurns.reduce((sum, t) => sum + t.responses.filter((r) => r.status === 'responded').length, 0)} total responses`,
    });

    return NextResponse.json({
      success: true,
      mode: 'debate',
      topic,
      turns: debateTurns,
      logs,
      rounds: effectiveRounds,
      summary: `Debate complete — ${effectiveRounds} rounds with ${agents.length} agents.`,
    });
  } catch (error) {
    console.error('[Orchestra] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

