/**
 * EMG Core v49 Neural Code and Documentation Optimizer Engine
 * File Path: "src/lib/diagnostic-utils.ts"
 * Optimized for maximum performance, strict type safety, zero memory waste, and robust execution.
 */

const EVOLUTION_PREFIX = '[DARLEK-CANN-EVOLUTION]';

/**
 * Logs an evolution diagnostic message with a standardized prefix.
 * 
 * @throws {TypeError} If the message is not a string (safely caught and handled).
 * @param {string} msg - The message to log.
 * @returns {void}
 */
export const logEvolution = (msg: string): void => {
  if (typeof msg !== 'string') {
    console.warn(`${EVOLUTION_PREFIX}: Invalid message type passed to logEvolution`);
    return;
  }
  console.log(`${EVOLUTION_PREFIX}: ${msg}`);
};

/**
 * Sanitizes source code by removing single-line comments efficiently.
 * Uses an optimized regular expression designed to handle various line endings.
 * 
 * @param {string} code - The source code string to sanitize.
 * @returns {string} The sanitized source code without single-line comments.
 */
export const sanitizeCode = (code: string): string => {
  if (typeof code !== 'string' || code.length === 0) {
    return '';
  }
  // Highly optimized regex stripping out single-line comments while preserving structural line breaks
  return code.replace(/\/\/[^\r\n]*(\r?\n|$)/g, '$1');
};