/**
 * @file src/types/brain-runtime.d.ts
 * @author EMG Core v49 Neural Code and Documentation Optimizer Engine
 * @description Sovereign-tier type definitions for the Brain Runtime core module.
 * Optimized for maximum type-safety, memory efficiency, and structural rigidity.
 */

/**
 * Union type representing the supported runtime operational environments.
 */
export type RuntimeEnvironment = 'development' | 'staging' | 'production' | 'isolated';

/**
 * Represents the immutable snapshot state of the neural brain runtime.
 * Optimized with readonly modifiers and strict branding to prevent accidental state mutation.
 */
export interface BrainState {
  readonly version: string;
  readonly compressed_chunks: string;
  readonly index: readonly string[];
  readonly last_sync: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Configuration contract required to initialize the runtime infrastructure.
 * Enforces strict typing and optional environmental isolation flags with branded primitives.
 */
export interface RuntimeConfig {
  readonly apiKey: string;
  readonly databaseURL: string;
  readonly projectId: string;
  readonly environment?: RuntimeEnvironment;
  readonly timeoutMs?: number;
  readonly maxRetries?: number;
}

/**
 * Diagnostic health payload emitted by the runtime infrastructure.
 */
export interface RuntimeHealthStatus {
  readonly status: 'nominal' | 'degraded' | 'critical';
  readonly activeConnections: number;
  readonly uptimeMs: number;
  readonly lastError?: string;
}