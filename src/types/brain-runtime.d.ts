/**
 * @file src/types/brain-runtime.d.ts
 * @author EMG Core v49 Neural Code and Documentation Optimizer Engine
 * @description Sovereign-tier type definitions for the Brain Runtime core module.
 * Optimized for maximum type-safety, memory efficiency, and structural rigidity.
 */

/**
 * Represents the immutable snapshot state of the neural brain runtime.
 * Optimized with readonly modifiers to prevent accidental state mutation.
 */
export interface BrainState {
  readonly version: string;
  readonly compressed_chunks: string;
  readonly index: readonly string[];
  readonly last_sync: number;
}

/**
 * Configuration contract required to initialize the runtime infrastructure.
 * Enforces strict typing and optional environmental isolation flags.
 */
export interface RuntimeConfig {
  readonly apiKey: string;
  readonly databaseURL: string;
  readonly projectId: string;
  readonly environment?: 'development' | 'staging' | 'production';
  readonly timeoutMs?: number;
}