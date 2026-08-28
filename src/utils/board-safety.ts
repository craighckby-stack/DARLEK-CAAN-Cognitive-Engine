import { Chess, Square } from 'chess.js';

export const safeRemove = (board: Chess, square: Square): boolean => {
  const piece = board.get(square);
  if (piece?.type === 'k') return false;
  board.remove(square);
  return true;
};

export const safePut = (board: Chess, piece: { type: string; color: string }, square: Square): boolean => {
  const existing = board.get(square);
  if (existing?.type === 'k') return false;
  board.put(piece as any, square);
  return true;
};