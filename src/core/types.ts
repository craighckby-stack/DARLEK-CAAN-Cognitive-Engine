export type QuantumNodeState = 'STABLE' | 'MUTATING' | 'CRITICAL';

export interface QuantumNode<TInput = unknown, TOutput = unknown> {
  readonly id: string;
  readonly state: QuantumNodeState;
  execute(input: TInput): Promise<TOutput>;
  teardown(): void;
}

export interface EvolutionResult {
  readonly success: boolean;
  readonly logs: readonly string[];
  readonly timestamp: string;
}