/**
 * @file src/lib/types.ts
 * @module EMG Core v49 Neural Code and Documentation Optimizer Engine
 * @description Comprehensive, type-safe, and memory-efficient type definitions 
 * for CAAN System State, Evolution, Mutation Orchestration, and Multi-Agent Collaboration.
 */

// ─────────────────────────────────────────────
// Core Communication & Identity Types
// ─────────────────────────────────────────────

export type MessageRole = 'caan' | 'operator' | 'system';

export interface Message {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp: Date;
}

export type ConnectionStatusValue = 'idle' | 'testing' | 'connected' | 'error';

export interface ApiKeys extends Record<string, string | undefined> {
  readonly github: string;
  readonly gemini?: string;
}

export interface ConnectionStatus {
  readonly github: ConnectionStatusValue;
  readonly gemini?: ConnectionStatusValue;
}

export interface RepoConfig {
  readonly owner: string;
  readonly repo: string;
  readonly branch: string;
}

// ─────────────────────────────────────────────
// Metrics & System State
// ─────────────────────────────────────────────

export interface SaturationMetrics {
  readonly structuralChange: number;
  readonly semanticSaturation: number;
  readonly velocity: number;
  readonly identityPreservation: number;
  readonly capabilityAlignment: number;
  readonly crossFileImpact: number;
}

export interface SystemState {
  readonly setupComplete: boolean;
  readonly currentStep: number;
  readonly connectionStatus: ConnectionStatus;
  readonly apiKeys: ApiKeys;
  readonly repoConfig: RepoConfig;
  readonly evolutionCycle: number;
  readonly saturation: SaturationMetrics;
  readonly sessionStart: Date;
  readonly geminiGeoblocked?: boolean;
}

export type EvolutionLogType = 
  | 'SCAN' 
  | 'MUTATE' 
  | 'APPROVE' 
  | 'REJECT' 
  | 'ERROR' 
  | 'WARNING' 
  | 'HEALTH' 
  | 'SYSTEM' 
  | 'CONNECT' 
  | 'BACKUP' 
  | 'INFO';

export interface EvolutionLogEntry {
  readonly id: string;
  readonly type: EvolutionLogType;
  readonly description: string;
  readonly timestamp: Date;
  readonly details?: string;
}

// ─────────────────────────────────────────────
// GitHub & Repository Interaction Types
// ─────────────────────────────────────────────

export interface GitHubFile {
  readonly path: string;
  readonly size: number;
  readonly type: string;
  readonly sha?: string;
  readonly content?: string;
}

export interface BranchInfo {
  readonly name: string;
  readonly default: boolean;
}

// ─────────────────────────────────────────────
// Mutation & Coherence Types
// ─────────────────────────────────────────────

export interface RejectionMemoryItem {
  readonly filePath: string;
  readonly reason: string;
  readonly analysis: string;
  readonly riskScore: number;
}

export interface MutationProposal {
  readonly analysis: string;
  readonly proposedCode: string;
  readonly riskScore: number;
  readonly affectedFiles: readonly string[];
}

export type MutationStatus = 'pending' | 'approved' | 'rejected' | 'applied';

export interface PendingMutation {
  readonly id: string;
  readonly filePath: string;
  readonly fileSha?: string;
  readonly originalContent: string;
  readonly proposedCode: string;
  readonly analysis: string;
  readonly riskScore: number;
  readonly affectedFiles: readonly string[];
  readonly newFiles?: ReadonlyArray<{ readonly path: string; readonly content: string }>;
  readonly status: MutationStatus;
  readonly timestamp: Date;
  readonly targetBranch?: string;
}

export interface CoherenceGateResult {
  readonly passed: boolean;
  readonly reason: string;
  readonly riskScore: number;
  readonly saturationWarning: boolean;
}

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface HealthCheckResult {
  readonly metrics: SaturationMetrics;
  readonly overallHealth: HealthStatus;
}

export interface RejectionMemory {
  readonly id: string;
  readonly filePath: string;
  readonly reason: string;
  readonly analysis: string;
  readonly riskScore: number;
  readonly timestamp: Date;
}

// ─────────────────────────────────────────────
// Request Body Payloads
// ─────────────────────────────────────────────

export interface ChatRequestBody {
  readonly message: string;
  readonly history: readonly Message[];
  readonly systemState: SystemState;
}

export interface TestConnectionBody {
  readonly provider: 'github' | 'gemini';
  readonly key: string;
}

export interface ScanRepoBody {
  readonly token: string;
  readonly owner: string;
  readonly repo: string;
  readonly branch: string;
}

export interface ReadFileBody {
  readonly token: string;
  readonly owner: string;
  readonly repo: string;
  readonly branch: string;
  readonly path: string;
}

export interface ProposeBody {
  readonly fileContent: string;
  readonly filePath: string;
  readonly apiKeys?: ApiKeys;
  readonly rejectionMemory?: readonly RejectionMemoryItem[];
}

export interface WriteFileBody {
  readonly token: string;
  readonly owner: string;
  readonly repo: string;
  readonly branch: string;
  readonly path: string;
  readonly content: string;
  readonly sha: string;
  readonly commitMessage?: string;
}

// ─────────────────────────────────────────────
// Debate & Multi-Agent Types
// ─────────────────────────────────────────────

export interface DebateAgent {
  readonly id: string;
  readonly name: string;
  readonly status: 'active' | 'idle';
  readonly color: string;
  readonly icon: string;
}

export interface DebateState {
  readonly agents: readonly DebateAgent[];
  readonly currentTopic: string;
  readonly isActive: boolean;
}

export type VoteType = 'approve' | 'reject' | 'abstain';

export interface AgentVote {
  readonly agentId: string;
  readonly agentName: string;
  readonly vote: VoteType;
  readonly confidence: number;
  readonly reasoning: string;
  readonly provider: string;
}

export type ConsensusType = 'APPROVE' | 'REJECT' | 'TIED';

export interface DebateResult {
  readonly success: boolean;
  readonly votes: readonly AgentVote[];
  readonly consensus: ConsensusType;
  readonly approvals: number;
  readonly rejections: number;
  readonly abstains: number;
  readonly summary: string;
}

export interface StaticIssue {
  readonly type: string;
  readonly severity: string;
  readonly message: string;
}

export interface ImpactAnalysis {
  readonly staticIssues: readonly StaticIssue[];
  readonly llmAnalysis: string;
  readonly llmProvider: string;
  readonly totalIssues: number;
  readonly highSeverity: number;
  readonly mediumSeverity: number;
  readonly lowSeverity: number;
  readonly overallRisk: string;
  readonly summary: string;
}

// ─────────────────────────────────────────────
// Agent Orchestra Types
// ─────────────────────────────────────────────

export type OrchestraMode = 'parallel' | 'debate';

export type OrchestraAgentStatus = 'idle' | 'thinking' | 'responded' | 'error';

export interface OrchestraAgentConfig {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly icon: string;
  readonly systemInstruction: string;
}

export interface OrchestraAgentResult {
  readonly agentId: string;
  readonly agentName: string;
  readonly status: OrchestraAgentStatus;
  readonly response: string;
  readonly provider: string;
  readonly timestamp: string;
  readonly latencyMs: number;
}

export interface OrchestraDebateTurn {
  readonly round: number;
  readonly responses: readonly OrchestraAgentResult[];
}

export type DiagnosticLogType = 'call' | 'response' | 'error' | 'info';

export interface OrchestraDiagnosticLog {
  readonly id: string;
  readonly timestamp: string;
  readonly type: DiagnosticLogType;
  readonly agent?: string;
  readonly provider?: string;
  readonly message: string;
  readonly latencyMs?: number;
}

export interface OrchestraState {
  readonly isActive: boolean;
  readonly mode: OrchestraMode;
  readonly topic: string;
  readonly rounds: number;
  readonly isRunning: boolean;
  readonly agentConfigs: readonly OrchestraAgentConfig[];
  readonly agents: readonly OrchestraAgentResult[];
  readonly debateTurns: readonly OrchestraDebateTurn[];
  readonly diagnosticLogs: readonly OrchestraDiagnosticLog[];
  readonly showConfigModal: boolean;
  readonly showDiagnostic: boolean;
}