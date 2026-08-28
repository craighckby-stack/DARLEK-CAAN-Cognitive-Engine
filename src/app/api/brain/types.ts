/**
 * @file src/app/api/brain/types.ts
 * @module NeuralCode/BrainTypes
 * @version 49.0.0
 * @description Sovereign type definitions for neural mutations and cognitive health metrics.
 */

/**
 * Represents the lifecycle status of a neural code mutation.
 * @public
 */
export type MutationStatus = 'pending' | 'applied' | 'rejected';

/**
 * Immutable payload structure describing a code mutation event.
 * Enforces strict readonly boundaries for memory efficiency and state predictability.
 * @public
 */
export interface MutationPayload extends Readonly<Record<string, unknown>> {
  readonly sessionId: string;
  readonly filePath: string;
  readonly status: MutationStatus;
  readonly riskScore: number;
  readonly analysis: string;
}

/**
 * Quantitative telemetry metrics measuring structural and semantic health.
 * @public
 */
export interface HealthMetrics extends Readonly<Record<string, number>> {
  readonly structuralChange: number;
  readonly semanticSaturation: number;
  readonly velocity: number;
  readonly identityPreservation: number;
  readonly capabilityAlignment: number;
  readonly crossFileImpact: number;
}