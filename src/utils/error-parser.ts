/**
 * @file src/utils/error-parser.ts
 * @module EMG.Core.ErrorParser
 * @version 4.9.0
 * @description High-performance, type-safe system error parsing and normalization engine.
 */

export interface SystemErrorPayload {
  readonly operationType?: string;
  readonly error?: string;
  readonly path?: string;
  readonly [key: string]: unknown;
}

export interface ParsedSystemError {
  readonly isSystemError: boolean;
  readonly message: string;
  readonly path: string;
}

const FALLBACK_PATH = 'N/A' as const;

/**
 * Parses an incoming Error object, extracting structured system error payloads if valid JSON,
 * or gracefully falling back to standard error representations with maximum memory and execution efficiency.
 *
 * @param {Error} error - The raw Error instance to parse.
 * @returns {ParsedSystemError} The normalized, type-safe error structure.
 */
export const parseSystemError = (error: Error): ParsedSystemError => {
  if (!error) {
    return {
      isSystemError: false,
      message: 'Unknown error occurred',
      path: FALLBACK_PATH,
    };
  }

  try {
    const data = JSON.parse(error.message) as SystemErrorPayload;
    const isSystemError = typeof data === 'object' && data !== null && Boolean(data.operationType);

    return {
      isSystemError,
      message: (typeof data.error === 'string' && data.error) || error.message,
      path: (typeof data.path === 'string' && data.path) || FALLBACK_PATH,
    };
  } catch {
    return {
      isSystemError: false,
      message: error.message,
      path: FALLBACK_PATH,
    };
  }
};