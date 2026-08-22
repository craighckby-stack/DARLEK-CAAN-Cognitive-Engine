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

/**
 * Safely fetch and parse JSON from an API endpoint, guarding against HTML error pages and network anomalies.
 */
export async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<{ success: boolean; data: T | null; status: number; error?: string }> {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    if (!text || !text.trim()) {
      return {
        success: res.ok,
        data: null,
        status: res.status,
        error: res.ok ? undefined : `HTTP ${res.status} Empty Response`,
      };
    }
    try {
      const json = JSON.parse(text);
      return {
        success: res.ok && (json.success !== false && json.error === undefined),
        data: json as T,
        status: res.status,
        error: json.error || (res.ok ? undefined : `HTTP ${res.status}`),
      };
    } catch {
      // HTML error page or non-JSON response
      return {
        success: false,
        data: null,
        status: res.status,
        error: `Server error (${res.status}): Non-JSON response received (possible route crash or payload limit).`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      data: null,
      status: 500,
      error: err?.message || 'Network request failed',
    };
  }
}
