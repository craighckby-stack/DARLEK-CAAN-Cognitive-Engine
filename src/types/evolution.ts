export interface IQuantumNode {
  stateVector: Record<string, any>;
  entanglementKey: string;
  collapse(): Promise<void>;
}

export interface EvolutionSnapshot {
  timestamp: number;
  checksum: string;
  affectedFiles: string[];
}