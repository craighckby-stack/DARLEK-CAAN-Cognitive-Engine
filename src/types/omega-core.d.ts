export interface OmegaState {
  id: string;
  status: 'initializing' | 'active' | 'quantum-locked' | 'error';
  timestamp: number;
  agentOrchestrationActive: boolean;
}

export interface TemporalCrucibleConfig {
  simulationRate: number;
  maxAgents: number;
  enableQuantumFallback: boolean;
}






































