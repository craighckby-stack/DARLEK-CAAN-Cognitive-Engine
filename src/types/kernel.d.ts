export interface SystemTelemetry {
  timestamp: number;
  module: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL';
}

export interface KernelConfig {
  version: string;
  debugMode: boolean;
}






































