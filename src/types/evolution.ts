/**
 * @file src/types/evolution.ts
 * @module EMG Core v49 Neural Code and Documentation Optimizer Engine
 * @description Highly optimized, memory-efficient, and type-safe type definitions for quantum nodes and evolution snapshots.
 */

/**
 * Represents a high-performance quantum node with strict state typing and asynchronous collapse handling.
 */
export interface IQuantumNode<TState extends Record<string, unknown> = Record<string, unknown>> {
  readonly stateVector: Readonly<TState>;
  readonly entanglementKey: string;
  collapse(): Promise<void>;
}

/**
 * Represents an immutable evolution snapshot capturing system state transitions.
 */
export interface EvolutionSnapshot {
  readonly timestamp: number;
  readonly checksum: string;
  readonly affectedFiles: readonly string[];
}