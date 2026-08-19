export interface Message {
  id: string;
  role: 'caan' | 'operator' | 'system';
  content: string;
  timestamp: Date;
}

export interface ApiKeys {
  [key: string]: string | undefined;
  github: string;
  gemini?: string;
}

export type ConnectionStatusValue = 'idle' | 'testing' | 'connected' | 'error';

export interface ConnectionStatus {
  github: ConnectionStatusValue;
  gemini?: ConnectionStatusValue;
}

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
}

export interface SystemState {
  setupComplete: boolean;
  currentStep: number;
  connectionStatus: ConnectionStatus;
  apiKeys: ApiKeys;
  repoConfig: RepoConfig;
  evolutionCycle: number;
  saturation: SaturationMetrics;
  sessionStart: Date;
  geminiGeoblocked?: boolean;
}

export interface SaturationMetrics {
  structuralChange: number;
  semanticSaturation: number;
  velocity: number;
  identityPreservation: number;
  capabilityAlignment: number;
  crossFileImpact: number;
}

export interface EvolutionLogEntry {
  id: string;
  type: 'SCAN' | 'MUTATE' | 'APPROVE' | 'REJECT' | 'ERROR' | 'WARNING' | 'HEALTH' | 'SYSTEM' | 'CONNECT' | 'BACKUP' | 'INFO';
  description: string;
  timestamp: Date;
  details?: string;
}

export interface GitHubFile {
  path: string;
  size: number;
  type: string;
  sha?: string;
  content?: string;
}

export interface MutationProposal {
  analysis: string;
  proposedCode: string;
  riskScore: number;
  affectedFiles: string[];
}

export interface HealthCheckResult {
  metrics: SaturationMetrics;
  overallHealth: 'healthy' | 'warning' | 'critical';
}

export interface ChatRequestBody {
  message: string;
  history: Message[];
  systemState: SystemState;
}

export interface TestConnectionBody {
  provider: 'github' | 'gemini';
  key: string;
}

export interface ScanRepoBody {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface ReadFileBody {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export interface ProposeBody {
  fileContent: string;
  filePath: string;
  apiKeys?: ApiKeys;
  rejectionMemory?: Array<{ filePath: string; reason: string; analysis: string; riskScore: number }>;
}

export interface DebateAgent {
  id: string;
  name: string;
  status: 'active' | 'idle';
  color: string;
  icon: string;
}

export interface WriteFileBody {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  content: string;
  sha: string;
  commitMessage?: string;
}

export interface PendingMutation {
  id: string;
  filePath: string;
  fileSha?: string;
  originalContent: string;
  proposedCode: string;
  analysis: string;
  riskScore: number;
  affectedFiles: string[];
  newFiles?: Array<{ path: string; content: string }>;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  timestamp: Date;
  targetBranch?: string;
}

export interface CoherenceGateResult {
  passed: boolean;
  reason: string;
  riskScore: number;
  saturationWarning: boolean;
}

export interface DebateState {
  agents: DebateAgent[];
  currentTopic: string;
  isActive: boolean;
}

export interface AgentVote {
  agentId: string;
  agentName: string;
  vote: 'approve' | 'reject' | 'abstain';
  confidence: number;
  reasoning: string;
  provider: string;
}

export interface DebateResult {
  success: boolean;
  votes: AgentVote[];
  consensus: 'APPROVE' | 'REJECT' | 'TIED';
  approvals: number;
  rejections: number;
  abstains: number;
  summary: string;
}

export interface RejectionMemory {
  id: string;
  filePath: string;
  reason: string;
  analysis: string;
  riskScore: number;
  timestamp: Date;
}

export interface BranchInfo {
  name: string;
  default: boolean;
}

export interface ImpactAnalysis {
  staticIssues: Array<{ type: string; severity: string; message: string }>;
  llmAnalysis: string;
  llmProvider: string;
  totalIssues: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  overallRisk: string;
  summary: string;
}

// ─────────────────────────────────────────────
// Agent Orchestra Types
// ────────────���────────────────────────────────

export type OrchestraMode = 'parallel' | 'debate';

export type OrchestraAgentStatus = 'idle' | 'thinking' | 'responded' | 'error';

export interface OrchestraAgentConfig {
  id: string;
  name: string;
  color: string;
  icon: string;
  systemInstruction: string;
}

export interface OrchestraAgentResult {
  agentId: string;
  agentName: string;
  status: OrchestraAgentStatus;
  response: string;
  provider: string;
  timestamp: string;
  latencyMs: number;
}

export interface OrchestraDebateTurn {
  round: number;
  responses: OrchestraAgentResult[];
}

export interface OrchestraDiagnosticLog {
  id: string;
  timestamp: string;
  type: 'call' | 'response' | 'error' | 'info';
  agent?: string;
  provider?: string;
  message: string;
  latencyMs?: number;
}

export interface OrchestraState {
  isActive: boolean;
  mode: OrchestraMode;
  topic: string;
  rounds: number;
  isRunning: boolean;
  agentConfigs: OrchestraAgentConfig[];
  agents: Array<{
    id: string;
    name: string;
    color: string;
    icon: string;
    status: OrchestraAgentStatus;
    response: string;
    provider: string;
    latencyMs: number;
  }>;
  debateTurns: OrchestraDebateTurn[];
  diagnosticLogs: OrchestraDiagnosticLog[];
  showConfigModal: boolean;
  showDiagnostic: boolean;
}
