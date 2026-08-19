import { Message, EvolutionLogEntry } from '@/lib/types';

export function createId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function createMessage(role: 'caan' | 'operator' | 'system', content: string): Message {
  return {
    id: createId(),
    role,
    content,
    timestamp: new Date()
  };
}

export function createLogEntry(type: EvolutionLogEntry['type'], description: string, details?: string): EvolutionLogEntry {
  return {
    id: createId(),
    type,
    description,
    timestamp: new Date(),
    details
  };
}
