/**
 * @file omega-core.d.ts
 * @version v49-optimized
 * @module OmegaCore
 * @description Sovereign type definitions and runtime boundary constraints for Omega Core architecture.
 */

/**
 * Represents the immutable execution lifecycle states of the Omega Core node.
 */
export type OmegaStatusCode = 'initializing' | 'active' | 'quantum-locked' | 'error';

/**
 * Immutable system telemetry state representing the exact runtime configuration
 * and operational posture of an Omega node.
 */
export interface OmegaState {
  readonly id: string;
  readonly status: OmegaStatusCode;
  readonly timestamp: number;
  readonly agentOrchestrationActive: boolean;
}

/**
 * Configuration parameters governing temporal execution, agent density limits,
 * and high-dimensional fallback protocols within the Crucible matrix.
 */
export interface TemporalCrucibleConfig {
  readonly simulationRate: number;
  readonly maxAgents: number;
  readonly enableQuantumFallback: boolean;
}

/**
 * High-performance utility type mapping exact read-only transformations for deep state immutability.
 */
export type DeepImmutable<T> = T extends (infer R)[]
  ? ReadonlyArray<DeepImmutable<R>>
  : T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepImmutable<T[K]> }
  : T;