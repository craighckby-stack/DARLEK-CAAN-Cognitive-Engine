export interface QuantumNode {
  id: string;
  state: 'STABLE' | 'MUTATING' | 'CRITICAL';
  execute: (input: any) => Promise<any>;
  teardown: () => void;
}

export type EvolutionResult = {
  success: boolean;
  logs: string[];
  timestamp: string;
};