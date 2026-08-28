/**
 * @file src/types/kernel.d.ts
 * @version 4.9.0-CORE
 * @description Sovereign Neural Kernel Type Definitions & Telemetry Schemas
 * @optimizer EMG Core v49 Neural Code and Documentation Optimizer Engine
 */

export type SystemStatus = 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL';

export interface SystemTelemetry {
  readonly timestamp: number;
  readonly module: string;
  readonly status: SystemStatus;
}

export interface KernelConfig {
  readonly version: string;
  readonly debugMode: boolean;
}