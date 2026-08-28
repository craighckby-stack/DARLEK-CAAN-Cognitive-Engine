export type MutationStatus = 'pending' | 'applied' | 'rejected';

export interface MutationPayload extends Readonly<Record<string, unknown>> {
  readonly sessionId: string;
  readonly filePath: string;
  readonly status: MutationStatus;
  readonly riskScore: number;
  readonly analysis: string;
}

export interface HealthMetrics {
  readonly structuralChange: number;
  readonly semanticSaturation: number;
  readonly velocity: number;
  readonly identityPreservation: number;
  readonly capabilityAlignment: number;
  readonly crossFileImpact: number;
}