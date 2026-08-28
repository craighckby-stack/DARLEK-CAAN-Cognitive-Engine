/**
 * @file src/types.ts
 * @version 4.9.0-EMG
 * @engine EMG Core Neural Code and Documentation Optimizer
 * @description Sovereign type definitions optimizing runtime memory footprint,
 * structural immutability, and strict type safety for game state, settings, and dialogues.
 */

export const GameMode = {
  PVP: 'PVP',
  PVE: 'PVE',
  PVD: 'PVD',
  AVA: 'AVA',
} as const;

export type GameMode = typeof GameMode[keyof typeof GameMode];

export const GameDifficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;

export type GameDifficulty = typeof GameDifficulty[keyof typeof GameDifficulty];

export const BoardTheme = {
  CRUCIBLE: 'CRUCIBLE',
  CYBER: 'CYBER',
  OBSIDIAN: 'OBSIDIAN',
  CLASSIC: 'CLASSIC',
} as const;

export type BoardTheme = typeof BoardTheme[keyof typeof BoardTheme];

export type PieceColor = 'w' | 'b';

export type DalekEmotion = 
  | 'prophetic' 
  | 'maniacal' 
  | 'furious' 
  | 'calculating' 
  | 'victorious' 
  | 'panicked';

export type JesusTone = 
  | 'serene' 
  | 'righteous' 
  | 'compassionate' 
  | 'majestic' 
  | 'wrathful';

export interface MoveLog {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly piece: string;
  readonly color: PieceColor;
  readonly san: string;
  readonly timestamp: string;
}

export interface DalekDialogue {
  readonly text: string;
  readonly emotion: DalekEmotion;
  readonly prophecyLevel: number; // 0 to 100 percentage
  readonly timestamp: number;
}

export interface DebateDialogue {
  readonly caanText: string;
  readonly caanEmotion: DalekEmotion;
  readonly jesusText: string;
  readonly jesusTone: JesusTone;
  readonly prophecyLevel: number;
  readonly timestamp: number;
}

export interface CapturedPieces {
  readonly w: readonly string[];
  readonly b: readonly string[];
}

export interface GameSettings {
  readonly mode: GameMode;
  readonly difficulty: GameDifficulty;
  readonly theme: BoardTheme;
  readonly playerColor: PieceColor;
  readonly muteSounds: boolean;
  readonly synthesizerVolume: number;
}