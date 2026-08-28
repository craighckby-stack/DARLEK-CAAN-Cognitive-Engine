import { Chess, Square } from 'chess.js';

// Piece-square tables for tactical depth evaluation
// Standard chess evaluation values (from White's perspective, flipped for Black)
const pawnEval = [
  [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
  [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
  [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
  [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
  [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
  [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
  [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
  [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
];

const knightEval = [
  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
  [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
  [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
  [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
  [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
  [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
  [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
];

const bishopEval = [
  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  [-1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [-1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
  [-1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
  [-1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
  [-1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
  [-1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

const rookEval = [
  [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
  [0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
  [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [0.0,   0.0,  0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

const queenEval = [
  [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
  [-1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [-1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
  [-0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
  [0.0,   0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
  [-1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
  [-1.0,  0.0,  0.5,  0.0,  0.0,  0.5,  0.0, -1.0],
  [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

const kingEval = [
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
  [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
  [2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0],
  [2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0]
];

// Helper to evaluate static board value for Dalek Caan (Chaotic-Evil, aggressive, erratic, zero ethics)
function evaluateBoardForCaan(chess: Chess, chaosFactor?: number): number {
  let score = 0;
  const board = chess.board();

  // Dalek Caan is highly aggressive.
  // 1. Extreme greed: He values his own major pieces (Rooks, Queens) more.
  // 2. King attack: If White king is exposed or in check, huge bonus.
  // 3. Chaos coefficient: Add a larger random noise to make his moves wild and erratic.
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let value = 0;
      switch (piece.type) {
        case 'p':
          value = 10 + (piece.color === 'w' ? pawnEval[r][c] : pawnEval[7 - r][c]);
          break;
        case 'n':
          value = 30 + (piece.color === 'w' ? knightEval[r][c] : knightEval[7 - r][c]);
          break;
        case 'b':
          value = 30 + (piece.color === 'w' ? bishopEval[r][c] : bishopEval[7 - r][c]);
          break;
        case 'r':
          // ROOKS are Dalek Combat Drones - values them high!
          value = 56 + (piece.color === 'w' ? rookEval[r][c] : rookEval[7 - r][c]);
          break;
        case 'q':
          // QUEEN is Dalek Emperor/Empress - ultimate brute force value!
          value = 105 + (piece.color === 'w' ? queenEval[r][c] : queenEval[7 - r][c]);
          break;
        case 'k':
          value = 950 + (piece.color === 'w' ? kingEval[r][c] : kingEval[7 - r][c]);
          break;
      }

      if (piece.color === 'w') {
        score += value;
      } else {
        // Dalek Caan slightly over-values his superior black forces due to arrogance
        score -= value * 1.08;
      }
    }
  }

  // Caan loves to place Jesus's/White pieces in check (terrorizes them!)
  if (chess.inCheck() && chess.turn() === 'w') {
    score += 25; 
  }

  // Return with heavy noise for erratic "Dalek insanity" behavior
  // Modified to scale dynamically based on our custom sliders!
  const multiplier = chaosFactor !== undefined ? chaosFactor : 1;
  const range = Math.max(1, Math.round(4 * multiplier));
  const noise = Math.floor(Math.random() * (range * 2 + 1)) - range; 
  return score + noise;
}

// Helper to evaluate static board value for Jesus's (Serene, compassionate, wise, values the weak/meek)
function evaluateBoardForJesus(chess: Chess): number {
  let score = 0;
  const board = chess.board();

  // Jesus values:
  // 1. "The meek shall inherit the earth" - Higher baseline for Pawns.
  // 2. Community: Connected pawns/pieces protecting each other get a solid support bonus.
  // 3. Perfect peace: Very tiny random noise so moves are highly calculated, calm, and righteous.
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let value = 0;
      switch (piece.type) {
        case 'p':
          // Pawns are weighted more (strength in the meek)
          value = 13 + (piece.color === 'w' ? pawnEval[r][c] : pawnEval[7 - r][c]);
          break;
        case 'n':
          value = 28 + (piece.color === 'w' ? knightEval[r][c] : knightEval[7 - r][c]);
          break;
        case 'b':
          // Bishops represent holy defenders
          value = 32 + (piece.color === 'w' ? bishopEval[r][c] : bishopEval[7 - r][c]);
          break;
        case 'r':
          value = 48 + (piece.color === 'w' ? rookEval[r][c] : rookEval[7 - r][c]);
          break;
        case 'q':
          // Not relying on singular brute force unit, balance and team play preferred
          value = 85 + (piece.color === 'w' ? queenEval[r][c] : queenEval[7 - r][c]);
          break;
        case 'k':
          value = 1000 + (piece.color === 'w' ? kingEval[r][c] : kingEval[7 - r][c]);
          break;
      }

      // Add family-support community ethics bonus for White pieces staying close to shield each other
      let communityBonus = 0;
      if (piece.color === 'w') {
        const adjacentCols = [c - 1, c + 1].filter(col => col >= 0 && col < 8);
        for (const col of adjacentCols) {
          // If supported by a friendly adjacent pawn
          const adjPiece = board[r][col];
          if (adjPiece && adjPiece.color === 'w' && adjPiece.type === 'p') {
            communityBonus += 1.5;
          }
        }
      }

      const totalVal = value + communityBonus;

      if (piece.color === 'w') {
        score += totalVal;
      } else {
        score -= totalVal;
      }
    }
  }

  // Clean, serene evaluation (no erratic noise)
  const noise = (Math.random() < 0.5) ? 0 : 1; 
  return score + noise;
}

// Minimax with Alpha-Beta Pruning
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean,
  brain: 'CAAN' | 'JESUS',
  chaosFactor?: number
): { score: number; move: string | null } {
  if (depth === 0 || chess.isGameOver()) {
    const score = brain === 'CAAN' ? evaluateBoardForCaan(chess, chaosFactor) : evaluateBoardForJesus(chess);
    return { score, move: null };
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    if (chess.inCheck()) {
      return { score: isMaximizingPlayer ? -Infinity : Infinity, move: null }; // Checkmate
    }
    return { score: 0, move: null }; // Stalemate
  }

  // Shuffle to prevent deterministic repeating / "mimicking" of symmetrical moves
  for (let i = moves.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [moves[i], moves[j]] = [moves[j], moves[i]];
  }

  // Basic move ordering: capture moves first for better alpha-beta pruning efficiency
  moves.sort((a, b) => {
    const aVal = a.captured ? 10 : 0;
    const bVal = b.captured ? 10 : 0;
    return bVal - aVal;
  });

  let bestMove: string | null = null;

  if (isMaximizingPlayer) {
    let maxScore = -Infinity;
    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' });
      const { score } = minimax(chess, depth - 1, alpha, beta, false, brain, chaosFactor);
      chess.undo();

      if (score > maxScore) {
        maxScore = score;
        bestMove = move.lan; // Use SAN or LAN. LAN is safer to rebuild moves (from-to)
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) {
        break; // beta cutoff
      }
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' });
      const { score } = minimax(chess, depth - 1, alpha, beta, true, brain, chaosFactor);
      chess.undo();

      if (score < minScore) {
        minScore = score;
        bestMove = move.lan;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) {
        break; // alpha cutoff
      }
    }
    return { score: minScore, move: bestMove };
  }
}

/**
 * Validates that a FEN string has exactly one white king and exactly one black king.
 */
export function isSafeFen(fen: string): boolean {
  if (!fen) return false;
  try {
    const temp = new Chess(fen);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Computes the best move for the specified player color
 */
export function getBestMove(fen: string, color: 'w' | 'b', difficulty: 'EASY' | 'MEDIUM' | 'HARD', chaosFactor?: number): string | null {
  if (!isSafeFen(fen)) {
    console.error("Invalid FEN: missing king inside getBestMove", fen);
    return null;
  }
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });

  if (moves.length === 0) return null;

  const brain = color === 'b' ? 'CAAN' : 'JESUS';

  // Easy mode: 75% chance to make raw tactical greedy moves (depth 1), 25% random
  if (difficulty === 'EASY') {
    if (Math.random() < 0.25) {
      const idx = Math.floor(Math.random() * moves.length);
      return moves[idx].lan;
    }
    const { move } = minimax(chess, 1, -Infinity, Infinity, color === 'w', brain, chaosFactor);
    if (move) return move;
    return moves[0].lan;
  }

  // Medium mode: depth 2 search
  if (difficulty === 'MEDIUM') {
    const { move } = minimax(chess, 2, -Infinity, Infinity, color === 'w', brain, chaosFactor);
    if (move) return move;
    return moves[0].lan;
  }

  // Hard mode: depth 3 search
  if (difficulty === 'HARD') {
    const { move } = minimax(chess, 3, -Infinity, Infinity, color === 'w', brain, chaosFactor);
    if (move) return move;
    return moves[0].lan;
  }

  return moves[0].lan;
}






































