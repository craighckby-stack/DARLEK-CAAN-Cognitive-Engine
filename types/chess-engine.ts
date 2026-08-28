/**
 * DALEK CAAN CHESS ENGINE - TYPE DEFINITIONS
 * Siphoned from unitary-core, psr-governance, and darlek-cann-v3
 * Optimized by EMG Core v49 Neural Code and Documentation Optimizer Engine
 */

export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'w' | 'b';
export type Square = string & { readonly __brand: 'Square' };

export interface ChessPiece {
  readonly id: string;
  readonly type: PieceType;
  readonly color: PieceColor;
  readonly square: Square;
  readonly isResurrected?: boolean;
  readonly isRedeemed?: boolean;
}

export interface BoardState {
  readonly pieces: Readonly<Record<string, ChessPiece>>;
  readonly turn: PieceColor;
  readonly halfMoveClock: number;
  readonly fullMoveNumber: number;
  readonly capturedPieces: {
    readonly w: readonly ChessPiece[];
    readonly b: readonly ChessPiece[];
  };
}

export interface HeuristicEvaluation {
  readonly score: number;
  readonly materialScore: number;
  readonly positionalScore: number;
  readonly ethicalScore: number;
  readonly chaosNoise?: number;
}

export type InterventionType = 
  | 'VAPORIZE' 
  | 'SPAWN_DRONE' 
  | 'TELEPORT' 
  | 'CELESTIAL_RESURRECTION' 
  | 'SACRED_REDEMPTION';

export interface InterventionEvent {
  readonly id: string;
  readonly type: InterventionType;
  readonly actor: 'DALEK' | 'JESUS';
  readonly timestamp: number;
  readonly details: {
    readonly targetSquare?: Square;
    readonly sourceSquare?: Square;
    readonly pieceId?: string;
    readonly pieceType?: PieceType;
  };
  readonly isChallenged: boolean;
  readonly isReverted: boolean;
}

export interface GovernanceMetrics {
  readonly securityStateEntropy: number;
  readonly antifragilityIndex: number;
  readonly ethicalAlignmentVector: {
    readonly harmony: number;
    readonly destruction: number;
  };
}

export interface EngineConfig {
  readonly dalekChaosCoefficient: number;
  readonly jesusCommunityMultiplier: number;
  readonly cheatProbability: number;
  readonly miracleProbability: number;
  readonly useLLMFallback: boolean;
}

export interface SubscriptionTeardown {
  readonly unsubscribe: () => void;
}