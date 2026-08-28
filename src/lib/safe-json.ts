import type { NextRequest } from 'next/server';

/**
 * Interface for standard fetch JSON return structure
 */
export interface SafeFetchResult<T> {
  success: boolean;
  data: T | null;
  status: number;
  error?: string;
}

/**
 * Safely parse a JSON string with a fallback.
 */
export function safeParseJson<T = unknown>(str: string | null | undefined, fallback: T = {} as T): T {
  if (!str || typeof str !== 'string') {
    return fallback;
  }
  
  const trimmed = str.trim();
  if (!trimmed) {
    return fallback;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely parse a Request body (e.g. NextRequest) without throwing SyntaxError on empty body.
 */
export async function safeReqJson<T = unknown>(req: Request | NextRequest, fallback: T = {} as T): Promise<T> {
  try {
    const text = await req.text();
    if (!text) {
      return fallback;
    }
    
    const trimmed = text.trim();
    if (!trimmed) {
      return fallback;
    }

    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely parse a fetch Response body without throwing SyntaxError on non-JSON or empty response.
 */
export async function safeResponseJson<T = unknown>(res: Response, fallback: T = {} as T): Promise<T> {
  try {
    const text = await res.text();
    if (!text) {
      return fallback;
    }
    
    const trimmed = text.trim();
    if (!trimmed) {
      return fallback;
    }

    try {
      return JSON.parse(trimmed) as T;
    } catch {
      // In case of non-JSON response, augment fallback with raw diagnostics safely
      if (typeof fallback === 'object' && fallback !== null) {
        return { 
          ...fallback, 
          error: trimmed.slice(0, 200), 
          rawText: trimmed 
        } as unknown as T;
      }
      return fallback;
    }
  } catch {
    return fallback;
  }
}

/**
 * Safely fetch and parse JSON from an API endpoint, guarding against HTML error pages and network anomalies.
 */
export async function safeFetchJson<T = unknown>(
  url: string, 
  options?: RequestInit
): Promise<SafeFetchResult<T>> {
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

    const trimmed = text.trim();

    try {
      const json = JSON.parse(trimmed);
      const isSuccess = res.ok && (json?.success !== false && json?.error === undefined);
      
      return {
        success: isSuccess,
        data: json as T,
        status: res.status,
        error: json?.error || (res.ok ? undefined : `HTTP ${res.status}`),
      };
    } catch {
      // HTML error page or non-JSON response captured securely
      return {
        success: false,
        data: null,
        status: res.status,
        error: `Server error (${res.status}): Non-JSON response received (possible route crash or payload limit).`,
      };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Network request failed';
    return {
      success: false,
      data: null,
      status: 500,
      error: errorMessage,
    };
  }
}