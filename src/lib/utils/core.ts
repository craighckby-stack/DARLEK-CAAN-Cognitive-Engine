import { Message, EvolutionLogEntry } from '@/lib/types';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 8;

export function createId(): string {
  let id = '';
  const randomValues = new Uint8Array(ID_LENGTH);
  
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < ID_LENGTH; i++) {
      id += ALPHABET[randomValues[i] % ALPHABET.length];
    }
  } else {
    for (let i = 0; i < ID_LENGTH; i++) {
      id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
  }
  
  return id;
}

export function createMessage(role: 'caan' | 'operator' | 'system', content: string): Message {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid message content: must be a non-empty string.');
  }

  return {
    id: createId(),
    role,
    content,
    timestamp: new Date()
  };
}

export function createLogEntry(type: EvolutionLogEntry['type'], description: string, details?: string): EvolutionLogEntry {
  if (!description || typeof description !== 'string') {
    throw new Error('Invalid log description: must be a non-empty string.');
  }

  return {
    id: createId(),
    type,
    description,
    timestamp: new Date(),
    ...(details !== undefined && { details })
  };
}