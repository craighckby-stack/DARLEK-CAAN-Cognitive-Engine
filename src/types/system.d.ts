export type SystemMode = 'development' | 'production' | 'staging';

export interface SystemConfig {
  readonly version: string;
  readonly mode: SystemMode;
  readonly debug: boolean;
}

export interface AgentOrchestratorProps {
  readonly orchestratorId: string;
  readonly priority: number;
}

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};