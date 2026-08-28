/**
 * @file src/types/orchestrator.d.ts
 * @module EMG Core v49 Neural Code and Documentation Optimizer Engine
 * @description Sovereign type definitions for orchestrator agents and system states.
 * Maximizes type-safety, memory efficiency through readonly modifiers, and runtime predictability.
 */

export type AgentRole = 'controller' | 'worker' | 'observer';

export type SystemStatus = 'active' | 'dormant' | 'evolving';

export interface AgentConfig {
  readonly id: string;
  readonly role: AgentRole;
  readonly priority: number;
  readonly memoryBuffer: boolean;
}

export interface SystemState {
  readonly status: SystemStatus;
  readonly lastSync: string; // ISO 8601 timestamp string
  readonly activeAgents: readonly AgentConfig[];
}