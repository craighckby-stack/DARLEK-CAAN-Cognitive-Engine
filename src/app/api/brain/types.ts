export interface MutationPayload {
  sessionId: string;
  filePath: string;
  status: 'pending' | 'applied' | 'rejected';
  riskScore: number;
  analysis: string;
  [key: string]: any;
}

export interface HealthMetrics {
  structuralChange: number;
  semanticSaturation: number;
  velocity: number;
  identityPreservation: number;
  capabilityAlignment: number;
  crossFileImpact: number;
}