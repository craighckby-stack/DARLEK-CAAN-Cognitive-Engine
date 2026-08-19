import { NextRequest } from 'next/server';

/**
 * Safely parse a JSON string with a fallback.
 */
export function safeParseJson<T = any>(str: string | null | undefined, fallback: any = {}): T {
  if (!str || typeof str !== 'string' || !str.trim()) {
    return fallback;
  }
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely parse a Request body (e.g. NextRequest) without throwing SyntaxError on empty body.
 */
export async function safeReqJson<T = any>(req: Request | NextRequest, fallback: any = {}): Promise<T> {
  try {
    const text = await req.text();
    if (!text || !text.trim()) {
      return fallback;
    }
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely parse a fetch Response body without throwing SyntaxError on non-JSON or empty response.
 */
export async function safeResponseJson<T = any>(res: Response, fallback: any = {}): Promise<T> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return fallback;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      return { ...fallback, error: text.slice(0, 200), rawText: text } as any;
    }
  } catch {
    return fallback;
  }
}
