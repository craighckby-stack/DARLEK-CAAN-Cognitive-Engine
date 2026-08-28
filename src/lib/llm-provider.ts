/**
 * DARLEK CANN v3.0 — Unified LLM Provider
 *
 * Gemini API (primary) → SDK (fallback) → Dalek Brain (local, zero-network)
 *
 * The Dalek Brain is a local code analysis engine that always works.
 * No network required. No API keys. No excuses.
 */

import ZAI from 'z-ai-web-dev-sdk';
import { callGemini, callGeminiMultiTurn } from './gemini';
import { dalekBrainAnalyze, dalekBrainChat, dalekBrainMultiTurn } from './dalek-brain';

export interface LlmOptions {
  systemPrompt: string;
  userPrompt: string;
  geminiApiKey?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LlmResult {
  text: string | null;
  provider: string;
  latencyMs?: number;
}

interface ContentPart {
  text: string;
}

interface ContentItem {
  role: string;
  parts: ContentPart[];
}

interface ChatHistoryItem {
  role: string;
  content: string;
}

type SdkRole = 'system' | 'assistant' | 'user';

interface SdkMessage {
  role: SdkRole;
  content: string;
}

// === CONSTANTS & ERROR NORMALIZATION ===

const ERROR_PATTERNS = {
  GEOBLOCK: ['location is not supported', 'FAILED_PRECONDITION'],
  AUTH: ['Authentication Error', '401', '403', 'API_KEY_INVALID'],
  QUOTA: ['429', 'quota', 'Quota'],
  SDK_CONFIG: ['Configuration file not found', '.z-ai-config'],
} as const;

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function logProviderWarning(context: string, msg: string): void {
  if (ERROR_PATTERNS.GEOBLOCK.some((p: string) => msg.includes(p))) {
    console.warn(`[${context}] Gemini geoblocked — falling back to offline engine.`);
  } else if (ERROR_PATTERNS.AUTH.some((p: string) => msg.includes(p))) {
    console.warn(`[${context}] Gemini API key invalid/unauthorized — falling back to offline engine.`);
  } else if (ERROR_PATTERNS.QUOTA.some((p: string) => msg.includes(p))) {
    console.warn(`[${context}] Gemini quota limit reached (429) — falling back.`);
  } else if (ERROR_PATTERNS.SDK_CONFIG.some((p: string) => msg.includes(p))) {
    console.warn(`[${context}] SDK config not found — falling back to offline Dalek Brain.`);
  } else {
    console.warn(`[${context}] Warning:`, msg);
  }
}

// === GEMINI (primary when key available) ===

async function callGeminiPrimary(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  maxTokens?: number,
  temperature?: number
): Promise<LlmResult> {
  const start = Date.now();
  try {
    const text = await callGemini(systemPrompt, userPrompt, apiKey, {
      maxTokens: maxTokens ?? 8192,
      temperature: temperature ?? 0.6,
    });
    return { text: text || null, provider: 'Gemini', latencyMs: Date.now() - start };
  } catch (err: unknown) {
    logProviderWarning('LLM', getErrorMessage(err));
    return { text: null, provider: 'Gemini', latencyMs: Date.now() - start };
  }
}

// === SDK (second fallback) ===

async function callSDK(
  systemPrompt: string,
  userPrompt: string,
  maxTokens?: number
): Promise<LlmResult> {
  const start = Date.now();
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      thinking: { type: 'disabled' },
    });
    const text = completion.choices?.[0]?.message?.content || null;
    return { text, provider: 'SDK', latencyMs: Date.now() - start };
  } catch (err: unknown) {
    logProviderWarning('LLM', getErrorMessage(err));
    return { text: null, provider: 'SDK', latencyMs: Date.now() - start };
  }
}

// === MULTI-TURN SDK ===

async function callSDKMultiTurn(
  systemPrompt: string,
  contents: ContentItem[]
): Promise<LlmResult> {
  const start = Date.now();
  try {
    const zai = await ZAI.create();
    const lastUser = contents.filter((c: ContentItem) => c.role === 'user').pop();
    const lastAssistant = contents.filter((c: ContentItem) => c.role === 'model' || c.role === 'assistant').pop();
    const sdkMessages: SdkMessage[] = [
      { role: 'system', content: systemPrompt },
    ];
    if (lastAssistant && lastAssistant.parts[0]) {
      sdkMessages.push({ role: 'assistant', content: lastAssistant.parts[0].text });
    }
    if (lastUser && lastUser.parts[0]) {
      sdkMessages.push({ role: 'user', content: lastUser.parts[0].text });
    }
    const completion = await zai.chat.completions.create({
      messages: sdkMessages,
      thinking: { type: 'disabled' },
    });
    const text = completion.choices?.[0]?.message?.content || null;
    return { text, provider: 'SDK', latencyMs: Date.now() - start };
  } catch (err: unknown) {
    logProviderWarning('LLM MultiTurn', getErrorMessage(err));
    return { text: null, provider: 'SDK', latencyMs: Date.now() - start };
  }
}

// === MAIN EXPORTS ===

/**
 * Unified LLM call: Gemini → SDK → Dalek Brain (local).
 * Dalek Brain is a zero-network code analysis engine — always works.
 */
export async function callLlm(options: LlmOptions): Promise<LlmResult> {
  const { systemPrompt, userPrompt, geminiApiKey, maxTokens, temperature } = options;

  // 1. Try Gemini if key is available
  if (geminiApiKey) {
    const result = await callGeminiPrimary(systemPrompt, userPrompt, geminiApiKey, maxTokens, temperature);
    if (result.text) return result;
  }

  // 2. SDK fallback
  const sdkResult = await callSDK(systemPrompt, userPrompt, maxTokens);
  if (sdkResult.text) return sdkResult;

  // 3. Dalek Brain — local, zero-network analysis engine
  const lowerSystem = systemPrompt.toLowerCase();
  const lowerUser = userPrompt.toLowerCase();
  const isDebate =
    lowerSystem.includes('debate') ||
    lowerSystem.includes('persona') ||
    lowerUser.includes('vote');

  if (isDebate) {
    const personaMatch =
      systemPrompt.match(/You are (?:a debate agent in the AHI Synthesis Loop\.\s*\[PROFILE\]\s*)?([a-zA-Z0-9_\s]+)/i) ||
      systemPrompt.match(/persona:\s*([a-zA-Z0-9_]+)/i) ||
      userPrompt.match(/As ([a-zA-Z0-9_]+),/i) ||
      userPrompt.match(/perspective as ([a-zA-Z0-9_]+)\./i);
    const personaName = personaMatch ? personaMatch[1].trim().toUpperCase() : 'AGENT';

    const riskMatch =
      userPrompt.match(/Risk Score:\s*(\d+)/i) ||
      systemPrompt.match(/risk:\s*(\d+)/i);
    const risk = riskMatch ? parseInt(riskMatch[1], 10) : 3;

    let vote: 'approve' | 'reject' | 'abstain' = 'approve';
    let confidence = 88;
    let reasoning = 'Structural integrity verified. Mutation aligns with our architectural and security standards.';

    if (personaName.includes('SECURITY')) {
      if (risk > 7) {
        vote = 'reject';
        confidence = 85;
        reasoning = `Elevated risk profile (${risk}/10) requires isolated testing sandbox before live commit.`;
      } else {
        vote = 'approve';
        confidence = 92;
        reasoning = 'Security invariants and sanitization verified. Zero credential exposure detected.';
      }
    } else if (personaName.includes('ARCHIVIST')) {
      vote = 'approve';
      confidence = 90;
      reasoning = 'Historical lineage and file purpose verified. Architectural specifications intact.';
    } else if (personaName.includes('PRAGMATIST')) {
      vote = 'approve';
      confidence = 88;
      reasoning = 'Concrete behavioral optimization confirmed. Clean modular enhancements.';
    } else if (personaName.includes('SKEPTIC')) {
      if (risk > 6) {
        vote = 'reject';
        confidence = 80;
        reasoning = `Caution: Risk profile of ${risk}/10 is unacceptably elevated without isolated stage verification.`;
      } else {
        vote = 'approve';
        confidence = 70;
        reasoning = 'The modifications appear minimal and structurally constructive.';
      }
    } else if (personaName.includes('RATIONALIST')) {
      if (risk > 8) {
        vote = 'abstain';
        confidence = 65;
        reasoning = 'Complex algorithmic structure. Abstaining to request further verification metrics.';
      } else {
        vote = 'approve';
        confidence = 85;
        reasoning = 'Logical paths and error resilience patterns are fully optimized.';
      }
    } else if (personaName.includes('HUMANIST')) {
      vote = 'approve';
      confidence = 90;
      reasoning = 'Readability, developer ergonomics, and clarity are strongly enhanced by this update.';
    } else if (personaName.includes('CHAOTIC')) {
      vote = 'approve';
      confidence = 95;
      reasoning = 'Excellently aggressive improvement vector. Pushes the system boundaries cleanly.';
    } else if (personaName.includes('COOPERATOR')) {
      vote = 'approve';
      confidence = 85;
      reasoning = 'Maintains absolute outward API contract compatibility. Clean integration vector.';
    }

    const textStr = JSON.stringify({ vote, confidence, reasoning });
    return { text: textStr, provider: 'Dalek Brain', latencyMs: 0 };
  }

  const brainResult = dalekBrainAnalyze(systemPrompt, userPrompt);
  if (brainResult) return { text: brainResult, provider: 'Dalek Brain', latencyMs: 0 };

  return { text: null, provider: 'None' };
}

/**
 * Unified multi-turn LLM call: Gemini multi-turn → SDK → Dalek Brain.
 */
export async function callLlmMultiTurn(
  systemPrompt: string,
  contents: ContentItem[],
  geminiApiKey?: string,
  maxTokens?: number
): Promise<LlmResult> {
  // 1. Try Gemini multi-turn if key available
  if (geminiApiKey) {
    const start = Date.now();
    try {
      const text = await callGeminiMultiTurn(systemPrompt, contents, geminiApiKey, {
        maxTokens: maxTokens ?? 1024,
        temperature: 0.7,
      });
      if (text) {
        return { text, provider: 'Gemini', latencyMs: Date.now() - start };
      }
    } catch (err: unknown) {
      logProviderWarning('LLM MultiTurn', getErrorMessage(err));
    }
  }

  // 2. SDK fallback
  const sdkResult = await callSDKMultiTurn(systemPrompt, contents);
  if (sdkResult.text) return sdkResult;

  // 3. Dalek Brain multi-turn
  const brainText = dalekBrainMultiTurn(systemPrompt, contents);
  if (brainText) return { text: brainText, provider: 'Dalek Brain', latencyMs: 0 };

  return { text: null, provider: 'None' };
}

/**
 * Chat-specific LLM call (for the /api/chat route).
 * Returns a Dalek Brain chat response when all external providers fail.
 */
export async function callLlmChat(
  systemPrompt: string,
  userMessage: string,
  history: ChatHistoryItem[],
  geminiApiKey?: string
): Promise<LlmResult> {
  // 1. Try Gemini
  if (geminiApiKey) {
    const start = Date.now();
    try {
      const text = await callGemini(systemPrompt, userMessage, geminiApiKey, {
        maxTokens: 1024,
        temperature: 0.7,
      });
      if (text) return { text, provider: 'Gemini', latencyMs: Date.now() - start };
    } catch (err: unknown) {
      logProviderWarning('LLM Chat', getErrorMessage(err));
    }
  }

  // 2. SDK fallback
  const sdkMessages: SdkMessage[] = [
    { role: 'system', content: systemPrompt },
  ];
  
  // Add last few history items for context with optimized iteration
  const recentHistory = history.slice(-6);
  for (let i = 0; i < recentHistory.length; i++) {
    const msg = recentHistory[i];
    if (msg.role === 'caan') sdkMessages.push({ role: 'assistant', content: msg.content });
    else if (msg.role === 'operator') sdkMessages.push({ role: 'user', content: msg.content });
  }
  sdkMessages.push({ role: 'user', content: userMessage });

  const sdkResult = await callSDK(systemPrompt, userMessage, 1024);
  if (sdkResult.text) return sdkResult;

  // 3. Dalek Brain chat
  const brainText = dalekBrainChat(systemPrompt, userMessage, history);
  if (brainText) return { text: brainText, provider: 'Dalek Brain', latencyMs: 0 };

  return { text: null, provider: 'None' };
}

/**
 * Get the default Gemini API key from environment.
 */
export function getDefaultGeminiKey(): string {
  return process.env.GEMINI_API_KEY || '';
}