/**
 * @file src/types/manifest.d.ts
 * @module EMG Core v49 Neural Code and Documentation Optimizer Engine
 * @description Highly optimized, strict, and memory-efficient type definitions for project manifests.
 */

export type SemanticVersion = `${number}.${number}.${number}` | string;

export type EnvironmentType = 'development' | 'staging' | 'production' | 'testing' | string;

export type TelemetryLevel = 'none' | 'basic' | 'verbose' | 'full' | string;

export interface Capabilities {
  readonly serverSide: readonly string[];
  readonly clientSide: readonly string[];
}

export interface DeploymentConfig {
  readonly environment: EnvironmentType;
  readonly autoScaling: boolean;
  readonly telemetry: TelemetryLevel;
}

export interface ProjectManifest {
  readonly project: string;
  readonly version: SemanticVersion;
  readonly description: string;
  readonly architecture: Readonly<Record<string, string>>;
  readonly capabilities: Capabilities;
  readonly deployment: DeploymentConfig;
  readonly dependencies: Readonly<Record<string, string>>;
}