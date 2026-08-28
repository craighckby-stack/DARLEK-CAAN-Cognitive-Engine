/**
 * EMG Core v49 Neural Code and Documentation Optimizer Engine
 * File Path: "src/lib/diagnostic-utils.ts"
 */

/**
 * Logs an evolution diagnostic message with a standardized prefix.
 * @param msg - The message to log.
 */
export const logEvolution = (msg: string): void => {
  if (typeof msg !== 'string') {
    console.warn('[DARLEK-CANN-EVOLUTION]: Invalid message type passed to logEvolution');
    return;
  }
  console.log(`[DARLEK-CANN-EVOLUTION]: ${msg}`);
};

/**
 * Sanitizes source code by removing single-line comments efficiently.
 * Uses a robust regular expression designed to handle various line endings.
 * @param code - The source code string to sanitize.
 * @returns The sanitized source code without single-line comments.
 */
export const sanitizeCode = (code: string): string => {
  if (!code || typeof code !== 'string') {
    return '';
  }
  // Efficiently strips out single-line comments while preserving structural line breaks
  return code.replace(/\/\/[^\r\n]*(\r?\n|$)/g, '$1');
};