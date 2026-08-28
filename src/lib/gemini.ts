/**
 * DARLEK CAAN — Gemini API Utility
 *
 * Official @google/genai SDK implementation.
 * All external Gemini LLM calls route through this module.
 * Includes automated fallback across current Gemini 3.x models, concurrency limiting, and smart error handling.
 */

import { GoogleGenAI } from '@google/genai';

// Modern supported Gemini model candidates in priority order (Free-tier safe)
const MODEL_CANDIDATES = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
] as const;

let rateLimitUntil = 0;
let invalidKeyUntil = 0;
let lastInvalidKey = '';

function parseRetryDelayMs(errMsg: string): number {
  const secMatch =
    errMsg.match(/retryDelay["']?\s*:\s*["']?(\d+(?:\.\d+)?)s/i) ||
    errMsg.match(/retry in (\d+(?:\.\d+)?)s/i) ||
    errMsg.match(/please retry after (\d+)s/i);
  if (secMatch) {
    const seconds = parseFloat(secMatch[1]);
    return Math.max(5000, Math.min(seconds * 1000, 120000));
  }
  return 30000;
}

class ConcurrencyLimiter {
  private activeCount = 0;
  private queue: (() => void)[] = [];
  private readonly maxConcurrency: number;

  constructor(maxConcurrency = 2) {
    this.maxConcurrency = maxConcurrency;
  }

  async acquire(): Promise<void> {
    if (this.activeCount < this.maxConcurrency) {
      this.activeCount++;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    this.activeCount--;
    if (this.queue.length > 0) {
      this.activeCount++;
      const next = this.queue.shift();
      if (next) {
        setTimeout(() => next(), 100);
      }
    }
  }
}

const limiter = new ConcurrencyLimiter(2);

function getGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface GeminiCallConfig {
  maxTokens?: number;
  temperature?: number;
  responseMimeType?: string;
  responseSchema?: unknown;
}

export interface ChatPart {
  text: string;
}

export interface ChatContent {
  role: string;
  parts: ChatPart[];
}

/**
 * Call Gemini with single prompt and automatic model fallback
 */
export async function callGemini(
  systemInstruction: string,
  userPrompt: string,
  apiKey: string,
  options?: GeminiCallConfig
): Promise<string | null> {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) return null;

  const now = Date.now();
  if (now < rateLimitUntil) {
    return null;
  }
  if (cleanKey === lastInvalidKey && now < invalidKeyUntil) {
    return null;
  }

  await limiter.acquire();
  try {
    const ai = getGeminiClient(cleanKey);

    for (const model of MODEL_CANDIDATES) {
      try {
        const config: Record<string, unknown> = {
          temperature: options?.temperature ?? 0.6,
          maxOutputTokens: options?.maxTokens ?? 8192,
        };

        if (systemInstruction && systemInstruction.trim()) {
          config.systemInstruction = systemInstruction.trim();
        }
        if (options?.responseMimeType) {
          config.responseMimeType = options.responseMimeType;
        }
        if (options?.responseSchema) {
          config.responseSchema = options.responseSchema;
        }

        const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config,
        });

        const text = response?.text;
        if (text && typeof text === 'string') {
          return text;
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        const isAuthError =
          errMsg.includes('401') ||
          errMsg.includes('403') ||
          errMsg.includes('API_KEY_INVALID') ||
          errMsg.includes('API key not valid') ||
          errMsg.includes('invalid API key') ||
          errMsg.includes('key is not valid');

        if (isAuthError) {
          invalidKeyUntil = Date.now() + 60000;
          lastInvalidKey = cleanKey;
          console.warn('[Gemini API] API key validation failed (401/403) — falling back to local engine.');
          return null;
        }

        const isGeoblocked =
          errMsg.includes('location is not supported') ||
          errMsg.includes('Location is not supported') ||
          errMsg.includes('FAILED_PRECONDITION');

        if (isGeoblocked) {
          rateLimitUntil = Date.now() + 300000;
          console.warn('[Gemini API] Region geoblocked — falling back to local engine.');
          return null;
        }

        const isRateLimit = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('Quota');
        if (isRateLimit) {
          const delayMs = parseRetryDelayMs(errMsg);
          rateLimitUntil = Date.now() + delayMs;
          console.warn(`[Gemini API] Quota/rate-limit reached on ${model} (cooldown: ${Math.round(delayMs / 1000)}s) — switching to local engine.`);
          return null;
        }
      }
    }

    return null;
  } finally {
    limiter.release();
  }
}

/**
 * Call Gemini with multi-turn conversation contents
 */
export async function callGeminiMultiTurn(
  systemInstruction: string,
  contents: ChatContent[],
  apiKey: string,
  options?: GeminiCallConfig
): Promise<string | null> {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) return null;

  const now = Date.now();
  if (now < rateLimitUntil) {
    return null;
  }
  if (cleanKey === lastInvalidKey && now < invalidKeyUntil) {
    return null;
  }

  await limiter.acquire();
  try {
    const ai = getGeminiClient(cleanKey);

    const formattedContents = contents.map((c) => ({
      role: c.role === 'model' || c.role === 'assistant' || c.role === 'caan' ? 'model' : 'user',
      parts: c.parts.map((p) => ({ text: p.text })),
    }));

    for (const model of MODEL_CANDIDATES) {
      try {
        const config: Record<string, unknown> = {
          temperature: options?.temperature ?? 0.6,
          maxOutputTokens: options?.maxTokens ?? 8192,
        };

        if (systemInstruction && systemInstruction.trim()) {
          config.systemInstruction = systemInstruction.trim();
        }
        if (options?.responseMimeType) {
          config.responseMimeType = options.responseMimeType;
        }
        if (options?.responseSchema) {
          config.responseSchema = options.responseSchema;
        }

        const response = await ai.models.generateContent({
          model,
          contents: formattedContents,
          config,
        });

        const text = response?.text;
        if (text && typeof text === 'string') {
          return text;
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        const isAuthError =
          errMsg.includes('401') ||
          errMsg.includes('403') ||
          errMsg.includes('API_KEY_INVALID') ||
          errMsg.includes('API key not valid') ||
          errMsg.includes('invalid API key');

        if (isAuthError) {
          invalidKeyUntil = Date.now() + 60000;
          lastInvalidKey = cleanKey;
          console.warn('[Gemini API] API key validation failed (401/403) — falling back to local engine.');
          return null;
        }

        const isGeoblocked =
          errMsg.includes('location is not supported') ||
          errMsg.includes('Location is not supported') ||
          errMsg.includes('FAILED_PRECONDITION');

        if (isGeoblocked) {
          rateLimitUntil = Date.now() + 300000;
          console.warn('[Gemini API] Region geoblocked — falling back to local engine.');
          return null;
        }

        const isRateLimit = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('Quota');
        if (isRateLimit) {
          const delayMs = parseRetryDelayMs(errMsg);
          rateLimitUntil = Date.now() + delayMs;
          console.warn(`[Gemini API] Quota/rate-limit reached on ${model} (cooldown: ${Math.round(delayMs / 1000)}s) — switching to local engine.`);
          return null;
        }
      }
    }

    return null;
  } finally {
    limiter.release();
  }
}