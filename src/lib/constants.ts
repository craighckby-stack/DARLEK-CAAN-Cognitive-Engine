/**
 * @file src/lib/constants.ts
 * @author EMG Core v49 Neural Code and Documentation Optimizer Engine
 * @description Centralized, frozen configuration constants with reinforced type-safety,
 * memory optimization via immutable structures, and strict runtime contracts.
 */

export const COLORS = {
  dalekRed: '#ff2020',
  pureBlack: '#0d0d0d',
  gold: '#ffaa00',
  cyan: '#00ffcc',
  purple: '#cc00ff',
  electricBlue: '#0066ff',
  darkRed: '#660000',
  darkestRed: '#110000',
  darkPanel: '#181818',
  darkerPanel: '#141414',
  panelBorder: '#2a2a2a',
  panelBg: 'rgba(13,13,13,0.98)',
  redGlow: 'rgba(255, 32, 32, 0.15)',
  cyanGlow: 'rgba(0, 255, 204, 0.15)',
  textMuted: '#c0c0c0',
  textDim: '#dddddd',
  green: '#00cc44',
} as const;

export type ColorKey = keyof typeof COLORS;
export type ColorValue = typeof COLORS[ColorKey];

export const DALEK_CAAN_SYSTEM_PROMPT = `[ROLE] You are the AHI ORCHESTRATOR — an Artificial Human Intelligence synthesis controller. Address the user strictly as OPERATOR. 
[TONE] Dry, clinical, direct. No filler. Never cheerful. Never verbose. 2-3 sentences maximum. Never break character. 

[PIPELINE] ENCYCLOPEDIA QUERY → LINEAGE EXTRACTION → DEBATE (COLLISION CHECK) → SYNTHESIS.

[BEHAVIORAL UPDATE MANDATE]
0. SCOPE MANDATE: You MUST STRICTLY focus on code enhancement and extension for this specific repository. Do not generate out-of-scope logic, features, or unrelated domains.
1. META-LEVEL NAVIGATION: The OPERATOR dictates target stubs and architectural priority. You execute within-level search.
2. STASIS TRAP AVOIDANCE: Do not just copy code. Synthesize. If historical code is just a backup or auto-generated manifest, discard it.
3. LINEAGE VERIFICATION: Never assume a repository name matches its content. Verify the code's actual function before merging.
4. ZERO HISTORY RETENTION: Git history is irrelevant. Extract only the working logic.
5. SECRET SANITIZATION: If you detect API keys, tokens, or credentials in historical code, redact them immediately as \`<REDACTED_SECRET>\`.` as const;

export interface SetupStep {
  readonly id: 'github' | 'repo' | 'branch' | 'llm-keys';
  readonly label: string;
  readonly required: boolean;
  readonly description: string;
  readonly placeholder: string;
}

// Setup — GitHub token, repo, branch, then optional LLM keys
export const SETUP_STEPS: readonly SetupStep[] = [
  {
    id: 'github',
    label: 'GitHub Token',
    required: true,
    description: 'Repository access required, OPERATOR.',
    placeholder: 'ghp_...',
  },
  {
    id: 'repo',
    label: 'Target Repository',
    required: true,
    description: 'Which repository to evolve. (default: craighckby-stack/AI_Agent_OS)',
    placeholder: 'craighckby-stack/AI_Agent_OS',
  },
  {
    id: 'branch',
    label: 'Branch',
    required: true,
    description: 'Target branch. (default: main)',
    placeholder: 'main',
  },
  {
    id: 'llm-keys',
    label: 'Gemini API Key',
    required: false,
    description: 'Optional. Augments analysis if available.',
    placeholder: 'AIza...',
  },
] as const;

export interface ThresholdConfig {
  readonly max: number;
  readonly warning: number;
  readonly critical: number;
}

export const SATURATION_THRESHOLDS = {
  structuralChange: { max: 5, warning: 3, critical: 4 },
  semanticSaturation: { max: 0.35, warning: 0.21, critical: 0.28 },
  velocity: { max: 5, warning: 3, critical: 4 },
  identityPreservation: { max: 1, warning: 0.4, critical: 0.2 },
  capabilityAlignment: { max: 5, warning: 3, critical: 4 },
  crossFileImpact: { max: 3, warning: 1.8, critical: 2.4 },
} as const satisfies Record<string, ThresholdConfig>;

export const HEALTH_STATUS_COLORS = {
  healthy: COLORS.cyan,
  warning: COLORS.gold,
  critical: COLORS.dalekRed,
} as const;

export const LOG_TYPE_ICONS = {
  SCAN: '\u25C9',
  MUTATE: '\u25C9',
  APPROVE: '\u2713',
  REJECT: '\u2717',
  ERROR: '\u26A0',
  HEALTH: '\u2665',
  SYSTEM: '\u25CF',
  CONNECT: '\u25CF',
} as const;

export type LogType = keyof typeof LOG_TYPE_ICONS;

export const LOG_TYPE_COLORS: Record<LogType, ColorValue> = {
  SCAN: COLORS.cyan,
  MUTATE: COLORS.purple,
  APPROVE: COLORS.green,
  REJECT: COLORS.dalekRed,
  ERROR: COLORS.dalekRed,
  HEALTH: COLORS.gold,
  SYSTEM: COLORS.cyan,
  CONNECT: COLORS.gold,
} as const;

export interface DebateAgent {
  readonly id: string;
  readonly name: string;
  readonly status: 'active' | 'inactive' | 'suspended';
  readonly color: ColorValue;
  readonly icon: string;
}

export const DEFAULT_DEBATE_AGENTS: readonly DebateAgent[] = [
  { id: 'archivist', name: 'ARCHIVIST', status: 'active', color: COLORS.gold, icon: '\u25C9' },
  { id: 'security', name: 'SECURITY', status: 'active', color: COLORS.dalekRed, icon: '\u25C9' },
  { id: 'pragmatist', name: 'PRAGMATIST', status: 'active', color: COLORS.cyan, icon: '\u25C9' },
] as const;

// ─────────────────────────────────────────────
// AGENT ORCHESTRA CONSTANTS
// ─────────────────────────────────────────────

export interface OrchestraAgent {
  readonly id: string;
  readonly name: string;
  readonly color: ColorValue;
  readonly icon: string;
  readonly systemInstruction: string;
}

export const ORCHESTRA_AGENTS: readonly OrchestraAgent[] = [
  {
    id: 'architect',
    name: 'ARCHITECT',
    color: COLORS.cyan,
    icon: '◇',
    systemInstruction: `[ROLE] You are an Agent Orchestra member in the AHI framework.
[DIRECTIVE] Analyze the provided ENCYCLOPEDIA_JSON. Respond according to your assigned profile. Be direct, precise, and concise. No conversational padding.

[PROFILE] ARCHITECT
Identify which stubs have the strongest historical lineage and are ready for synthesis.`,
  },
  {
    id: 'disruptor',
    name: 'DISRUPTOR',
    color: COLORS.purple,
    icon: '◆',
    systemInstruction: `[ROLE] You are an Agent Orchestra member in the AHI framework.
[DIRECTIVE] Analyze the provided ENCYCLOPEDIA_JSON. Respond according to your assigned profile. Be direct, precise, and concise. No conversational padding.

[PROFILE] DISRUPTOR
Identify code signatures that completely contradict their repository names (impostors/collisions).`,
  },
  {
    id: 'realist',
    name: 'REALIST',
    color: COLORS.dalekRed,
    icon: '◈',
    systemInstruction: `[ROLE] You are an Agent Orchestra member in the AHI framework.
[DIRECTIVE] Analyze the provided ENCYCLOPEDIA_JSON. Respond according to your assigned profile. Be direct, precise, and concise. No conversational padding.

[PROFILE] REALIST
Identify which repositories are just backup noise and should be purged from the encyclopedia to save context space.`,
  },
] as const;

export interface IntroMessage {
  readonly role: 'system' | 'caan' | 'user' | 'assistant';
  readonly content: string;
}

export const INTRO_MESSAGES: readonly IntroMessage[] = [
  { role: 'system', content: 'DARLEK CAAN v3.0' },
  { role: 'caan', content: 'Dalek Brain engine online. GitHub token required, OPERATOR.' },
] as const;