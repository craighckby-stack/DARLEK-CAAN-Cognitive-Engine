/**
 * @file src/types.ts
 * @version 4.9.1-EMG
 * @engine EMG Core Neural Code and Documentation Optimizer Engine
 * @description Sovereign type definitions optimized for maximum runtime memory efficiency,
 * strict structural immutability, and zero-cost type safety abstractions for game architecture.
 */

/**
 * Enumeration of supported competitive and cooperative game modes.
 * Implemented via const assertion for absolute runtime zero-overhead and strict typing.
 */
export const GameMode = {
  PVP: 'PVP',
  PVE: 'PVE',
  PVD: 'PVD',
  AVA: 'AVA',
} as const;

export type GameMode = (typeof GameMode)[keyof typeof GameMode];

/**
 * Enumeration of AI cognitive and strategic difficulties.
 */
export const GameDifficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;

export type GameDifficulty = (typeof GameDifficulty)[keyof typeof GameDifficulty];

/**
 * Enumeration of visual board themes and rendering profiles.
 */
export const BoardTheme = {
  CRUCIBLE: 'CRUCIBLE',
  CYBER: 'CYBER',
  OBSIDIAN: 'OBSIDIAN',
  CLASSIC: 'CLASSIC',
} as const;

export type BoardTheme = (typeof BoardTheme)[keyof typeof BoardTheme];

/**
 * Represents piece polarity/color identifier ('w' for white, 'b' for black).
 */
export type PieceColor = 'w' | 'b';

/**
 * Emotional spectrum states for synthetic Dalek telemetry and voice synthesis.
 */
export type DalekEmotion = 
  | 'prophetic' 
  | 'maniacal' 
  | 'furious' 
  | 'calculating' 
  | 'victorious' 
  | 'panicked';

/**
 * Theological tone profile states for divine discourse synthesis.
 */
export type JesusTone = 
  | 'serene' 
  | 'righteous' 
  | 'compassionate' 
  | 'majestic' 
  | 'wrathful';

/**
 * Immutable record of a executed board movement with complete cryptographic/chronological metadata.
 */
export interface MoveLog {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly piece: string;
  readonly color: PieceColor;
  readonly san: string;
  readonly timestamp: string;
}

/**
 * Real-time telemetry structure for Dalek dialogue synthesis nodes.
 */
export interface DalekDialogue {
  readonly text: string;
  readonly emotion: DalekEmotion;
  readonly prophecyLevel: number; // Normalized percentage metric (0 to 100)
  readonly timestamp: number;
}

/**
 * Synchronized telemetry structure for dialectical exchanges between intelligence entities.
 */
export interface DebateDialogue {
  readonly caanText: string;
  readonly caanEmotion: DalekEmotion;
  readonly jesusText: string;
  readonly jesusTone: JesusTone;
  readonly prophecyLevel: number;
  readonly timestamp: number;
}

/**
 * Immutable ledger tracking captured board assets partitioned by polarity.
 */
export interface CapturedPieces {
  readonly w: readonly string[];
  readonly b: readonly string[];
}

/**
 * Sovereign configuration profile governing runtime execution parameters and audio-visual settings.
 */
export interface GameSettings {
  readonly mode: GameMode;
  readonly difficulty: GameDifficulty;
  readonly theme: BoardTheme;
  readonly playerColor: PieceColor;
  readonly muteSounds: boolean;
  readonly synthesizerVolume: number; // Bounded floating point scalar [0.0, 1.0]
}