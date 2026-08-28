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

export type DeepReadonly<T> = T extends Function | Date | RegExp | Map<any, any> | Set<any, any>
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;