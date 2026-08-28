/**
 * @file src/lib/utils/core.ts
 * @module EMG Core v49 Neural Code and Documentation Optimizer Engine
 * @description Sovereign core utilities optimized for high-performance cryptographic ID generation, type safety, and memory efficiency.
 */

import { Message, EvolutionLogEntry } from '@/lib/types';

/**
 * Immutable character set optimized for URL-safe identifiers.
 */
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789' as const;

/**
 * Standard length for generated unique identifiers.
 */
const ID_LENGTH = 8 as const;

/**
 * Pre-allocated Uint8Array buffer for high-performance random value generation,
 * eliminating per-call memory allocation overhead.
 */
const RANDOM_BUFFER = typeof window !== 'undefined' && typeof window.crypto !== 'undefined' 
  ? new Uint8Array(ID_LENGTH) 
  : null;

/**
 * Generates a cryptographically secure, random alphanumeric identifier of fixed length.
 * Falls back to Math.random if a secure crypto environment is unavailable.
 * 
 * @returns {string} A unique 8-character string identifier.
 */
export function createId(): string {
  let id = '';
  
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const randomValues = RANDOM_BUFFER ?? new Uint8Array(ID_LENGTH);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < ID_LENGTH; i++) {
      id += ALPHABET[randomValues[i]! % ALPHABET.length];
    }
  } else {
    for (let i = 0; i < ID_LENGTH; i++) {
      id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
  }
  
  return id;
}

/**
 * Factory function to create a validated Message instance.
 * 
 * @param {'caan' | 'operator' | 'system'} role - The role of the message author.
 * @param {string} content - The text content of the message.
 * @returns {Message} A fully typed and stamped Message object.
 * @throws {TypeError} If content is missing or not a string.
 */
export function createMessage(role: Message['role'], content: string): Message {
  if (typeof content !== 'string' || content.length === 0) {
    throw new TypeError('Invalid message content: must be a non-empty string.');
  }

  return {
    id: createId(),
    role,
    content,
    timestamp: new Date()
  };
}

/**
 * Factory function to create a validated EvolutionLogEntry instance.
 * 
 * @param {EvolutionLogEntry['type']} type - The classification category of the log entry.
 * @param {string} description - A primary description of the evolution event.
 * @param {string} [details] - Optional granular details regarding the event.
 * @returns {EvolutionLogEntry} A fully typed and stamped EvolutionLogEntry object.
 * @throws {TypeError} If description is missing or not a string.
 */
export function createLogEntry(
  type: EvolutionLogEntry['type'], 
  description: string, 
  details?: string
): EvolutionLogEntry {
  if (typeof description !== 'string' || description.length === 0) {
    throw new TypeError('Invalid log description: must be a non-empty string.');
  }

  const entry: EvolutionLogEntry = {
    id: createId(),
    type,
    description,
    timestamp: new Date()
  };

  if (details !== undefined) {
    entry.details = details;
  }

  return entry;
}