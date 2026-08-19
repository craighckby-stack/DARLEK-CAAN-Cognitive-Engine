import { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { motion, AnimatePresence } from 'motion/react';
import { playSynthSound } from './SoundEngine';
import { BoardTheme, GameDifficulty } from '../types';

// Let's create beautiful high-fidelity custom SVG piece renderings
// Standard unicode can sometimes be hard to see or read, but these clean vector chess pieces are futuristic and extremely crisp!

interface ChessPieceSVGProps {
  type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
  color: 'w' | 'b';
  theme: BoardTheme;
}

export function ChessPieceSVG({ type, color, theme }: ChessPieceSVGProps) {
  // Color presets based on theme
  const getColors = () => {
    if (color === 'w') {
      switch (theme) {
        case BoardTheme.CRUCIBLE:
          return { fill1: '#ffffff', fill2: '#fca5a5', stroke: '#e11d48', glow: 'rgba(225, 29, 72, 0.5)' };
        case BoardTheme.CYBER:
          return { fill1: '#ffffff', fill2: '#a5f3fc', stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)' };
        case BoardTheme.OBSIDIAN:
          return { fill1: '#ffffff', fill2: '#fde68a', stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' };
        case BoardTheme.CLASSIC:
        default:
          return { fill1: '#ffffff', fill2: '#e2e8f0', stroke: '#475569', glow: 'transparent' };
      }
    } else {
      switch (theme) {
        case BoardTheme.CRUCIBLE:
          return { fill1: '#4c0519', fill2: '#270208', stroke: '#fb7185', glow: 'rgba(251, 113, 133, 0.4)' };
        case BoardTheme.CYBER:
          return { fill1: '#164e63', fill2: '#083344', stroke: '#22d3ee', glow: 'rgba(34, 211, 238, 0.5)' };
        case BoardTheme.OBSIDIAN:
          return { fill1: '#78350f', fill2: '#451a03', stroke: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' };
        case BoardTheme.CLASSIC:
        default:
          return { fill1: '#334155', fill2: '#0f172a', stroke: '#1e293b', glow: 'transparent' };
      }
    }
  };

  const { fill1, fill2, stroke, glow } = getColors();
  const shadowGlow = glow !== 'transparent' ? `drop-shadow(0 0 5px ${glow}) drop-shadow(0 4px 4px rgba(0,0,0,0.5))` : 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))';
  
  const gradId = `grad-${color}-${theme}-${type}`;

  const defsJSX = (
    <defs>
      <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={fill1} />
        <stop offset="100%" stopColor={fill2} />
      </linearGradient>
    </defs>
  );

  // Return crisp custom inline vector paths for each piece
  switch (type) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full p-1" style={{ filter: shadowGlow }}>
          {defsJSX}
          <g fill={`url(#${gradId})`} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 16,9 A 4,4 0 0,0 20,13 A 4,4 0 0,0 24,9 A 4,4 0 0,0 20,5 A 4,4 0 0,0 16,9 z" />
            <path d="M 22,9 C 22,11.5 21,11.5 21,12 C 21,14 22,16 22,18 C 22,19.5 21,21 21,21.5 C 21,22.5 22,23 22,24 C 22,26.5 23.5,28 25.5,31 L 14.5,31 C 16.5,28 18,26.5 18,24 C 18,23 18,22.5 18,21.5 C 18,21 17,19.5 17,18 C 17,16 18,14 18,12 C 18,11.5 17,11.5 17,9 z" />
            <path d="M 11.5,32.5 L 28.5,32.5 C 28.5,33.5 28,34 27.5,34.5 L 12.5,34.5 C 12,34 11.5,33.5 11.5,32.5 z" />
            <path d="M 10,36 C 14.5,35 15.5,35 20,35 C 24.5,35 25.5,35 30,36 C 30,37.5 29.5,38 29,38.5 L 11,38.5 C 10.5,38 10,37.5 10,36 z" />
          </g>
        </svg>
      );
    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full p-0.5" style={{ filter: shadowGlow }}>
          {defsJSX}
          <g fill={`url(#${gradId})`} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22,10 C 22,10 19,11 16,15 C 13,19 13,24 13,24 C 13,24 15,22 17,22 C 17,22 16,24 15,27 C 14,30 15,31.5 16,31.5 C 17,31.5 18,30 19,28 C 19,28 19,30 18,31.5 C 17,33 18,34 19,34 C 20,34 21.5,32 22.5,29 C 23.5,26 23.5,21 24,18 C 24.5,15 26.5,13 26.5,13 C 26.5,13 25,12 22,10 z" />
            <path d="M 9.5,35.5 L 30.5,35.5 C 31,37 30,38 29.5,38.5 L 10.5,38.5 C 10,38 9,37 9.5,35.5 z" />
            <circle cx="16.5" cy="16.5" r="1.5" fill={stroke} />
          </g>
        </svg>
      );
    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full p-1" style={{ filter: shadowGlow }}>
          {defsJSX}
          <g fill={`url(#${gradId})`} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,36 C 9,36 21,37 21,29 C 21,29 22.5,28.5 23,28 C 24,27 25,24 25,21 C 25,19 24.5,16.5 23,15 C 21.5,13.5 21.5,11.5 21,10 C 20.5,11.5 20.5,13.5 19,15 C 17.5,16.5 17,19 17,21 C 17,24 18,27 19,28 C 19.5,28.5 21,29 21,29 C 21,37 33,36 33,36 C 33,37 32,38 31,38.5 L 11,38.5 C 10,38 9,37 9,36 z" />
            <circle cx="21" cy="7" r="2.5" />
            <path d="M 17.5,19.5 L 24.5,19.5" stroke={stroke} strokeWidth="2" />
            <path d="M 21,16 C 21,16 21,22.5 21,23" stroke={stroke} strokeWidth="2" />
          </g>
        </svg>
      );
    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full p-1" style={{ filter: shadowGlow }}>
          {defsJSX}
          <g fill={`url(#${gradId})`} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,39 L 33,39 L 33,36 L 9,36 L 9,39 z" />
            <path d="M 12,36 L 12,22 L 30,22 L 30,36 L 12,36 z" />
            <path d="M 9,22 L 33,22 L 33,14 L 30,14 L 30,18 L 27,18 L 27,14 L 24,14 L 24,18 L 18,18 L 18,14 L 15,14 L 15,18 L 12,18 L 12,14 L 9,14 L 9,22 z" />
            <path d="M 14,29 L 28,29" />
            <path d="M 14,25 L 28,25" />
          </g>
        </svg>
      );
    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full p-0.5" style={{ filter: shadowGlow }}>
          {defsJSX}
          <g fill={`url(#${gradId})`} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,25 C 10.5,23.5 12,21.5 12.5,19 C 13,16.5 12.5,14 11.5,11 L 17.5,17 L 21,10.5 L 24.5,17 L 30.5,11 C 29.5,14 29,16.5 29.5,19 C 30,21.5 31.5,23.5 33,25 C 33,26 31.5,27.5 29,28 L 27,33 L 15,33 L 13,28 C 10.5,27.5 9,26 9,25 z" />
            <circle cx="11.5" cy="8.5" r="1.5" />
            <circle cx="17.5" cy="14" r="1.5" />
            <circle cx="21" cy="7.5" r="1.5" />
            <circle cx="24.5" cy="14" r="1.5" />
            <circle cx="30.5" cy="8.5" r="1.5" />
            <path d="M 9,37 L 33,37 L 33,35 C 33,35 29,34 21,34 C 13,34 9,35 9,35 L 9,37 z" />
          </g>
        </svg>
      );
    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full p-0.5" style={{ filter: shadowGlow }}>
          {defsJSX}
          <g fill={`url(#${gradId})`} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,36 C 9,36 10.5,35 12.5,35 C 14.5,35 15.5,35 17.5,35 C 19.5,35 20.5,35 21,34 C 21.5,35 22.5,35 24.5,35 C 26.5,35 27.5,35 29.5,35 C 31.5,35 33,36 33,36 C 33,37.5 32,38 31,38.5 L 11,38.5 C 10,38 9,37.5 9,36 z" />
            <path d="M 11.5,32.5 Q 21,34 30.5,32.5 L 29,20 Q 21,17 13,20 L 11.5,32.5 z" />
            <path d="M 15.5,20 L 18.5,13 L 23.5,13 L 26.5,20" />
            <circle cx="21" cy="11" r="2" />
            <path d="M 18.5,9.5 L 23.5,9.5" />
            <path d="M 21,7 L 21,12" />
          </g>
        </svg>
      );
  }
}

interface ChessBoardProps {
  chess: Chess;
  theme: BoardTheme;
  playerColor: 'w' | 'b';
  onMove: (from: string, to: string, promotion?: string) => void;
  interactive: boolean;
  isMuted: boolean;
  synthVolume: number;
}

export function ChessBoard({
  chess,
  theme,
  playerColor,
  onMove,
  interactive,
  isMuted,
  synthVolume,
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);

  // Keep track of check state to show alarm glow
  const isCheck = chess.inCheck();

  // Highlight squares for the last move
  const history = chess.history({ verbose: true });
  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  useEffect(() => {
    // If the game board changes, reset local triggers
    const timer = setTimeout(() => {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }, 0);
    return () => clearTimeout(timer);
  }, [chess]);

  // Click handler on board squares
  const handleSquareClick = (squareKey: Square) => {
    if (!interactive) return;

    // Is a move target clicked?
    if (possibleMoves.includes(squareKey)) {
      if (selectedSquare) {
        // Is it a pawn promotion move? (pawn moving to final rank 8 or 1)
        const piece = chess.get(selectedSquare);
        if (piece && piece.type === 'p' && (squareKey[1] === '8' || squareKey[1] === '1')) {
          setPromotionPending({ from: selectedSquare, to: squareKey });
          playSynthSound('blip', isMuted, synthVolume);
        } else {
          onMove(selectedSquare, squareKey);
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
      return;
    }

    // Otherwise, try selecting a piece
    const piece = chess.get(squareKey);
    if (piece && piece.color === chess.turn()) {
      // Check if board flip aligns or matches player select authorization
      setSelectedSquare(squareKey);
      const moves = chess.moves({ square: squareKey, verbose: true }) as any[];
      setPossibleMoves(moves.map((m) => m.to as Square));
      playSynthSound('blip', isMuted, synthVolume);
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  // Execute pawn promotion selection
  const handlePromoSelect = (promoCode: string) => {
    if (promotionPending) {
      onMove(promotionPending.from, promotionPending.to, promoCode);
      setPromotionPending(null);
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  // Render square design depending on theme selection
  const getSquareStyles = (r: number, c: number, isSelected: boolean, isPossibleTarget: boolean) => {
    const isLight = (r + c) % 2 === 0;

    let baseBg = '';
    let selectedBg = '';
    let targetBg = '';

    switch (theme) {
      case BoardTheme.CRUCIBLE:
        baseBg = isLight 
          ? 'bg-gradient-to-br from-white/[0.04] to-white/[0.02] shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] border-t border-l border-white/[0.12] border-b border-r border-black' 
          : 'bg-gradient-to-br from-[#7a1228] to-[#3b0611] shadow-[inset_0_0_15px_rgba(0,0,0,0.9)] border-t border-l border-[#e11d48]/30 border-b border-r border-black';
        selectedBg = 'bg-gradient-to-br from-rose-500/80 to-rose-700/80 ring-2 ring-rose-300 ring-inset shadow-[0_0_20px_rgba(225,29,72,0.8)]';
        targetBg = 'bg-rose-400/40 border-2 border-dashed border-rose-300 shadow-[inset_0_0_20px_rgba(225,29,72,0.3)]';
        break;
      case BoardTheme.CYBER:
        baseBg = isLight 
          ? 'bg-gradient-to-br from-slate-800 to-slate-950 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] border-t border-l border-slate-700/80 border-b border-r border-black' 
          : 'bg-gradient-to-br from-[#045e6b] to-[#022c33] shadow-[inset_0_0_15px_rgba(0,0,0,0.9)] border-t border-l border-[#06b6d4]/40 border-b border-r border-black';
        selectedBg = 'bg-gradient-to-br from-cyan-400/80 to-cyan-600/80 ring-2 ring-cyan-200 ring-inset shadow-[0_0_20px_rgba(6,182,212,0.8)]';
        targetBg = 'bg-cyan-400/40 border-2 border-dashed border-cyan-300 shadow-[inset_0_0_20px_rgba(6,182,212,0.3)]';
        break;
      case BoardTheme.OBSIDIAN:
        baseBg = isLight 
          ? 'bg-gradient-to-br from-stone-800 to-stone-950 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] border-t border-l border-stone-700/80 border-b border-r border-black' 
          : 'bg-gradient-to-br from-[#784204] to-[#381f01] shadow-[inset_0_0_15px_rgba(0,0,0,0.9)] border-t border-l border-amber-600/40 border-b border-r border-black';
        selectedBg = 'bg-gradient-to-br from-amber-500/80 to-amber-700/80 ring-2 ring-amber-200 ring-inset shadow-[0_0_20px_rgba(245,158,11,0.8)]';
        targetBg = 'bg-amber-400/40 border-2 border-dashed border-amber-300 shadow-[inset_0_0_20px_rgba(245,158,11,0.3)]';
        break;
      case BoardTheme.CLASSIC:
      default:
        baseBg = isLight 
          ? 'bg-gradient-to-br from-[#ffffff] to-[#e2e8f0] border-t border-l border-white shadow-[inset_2px_2px_8px_rgba(0,0,0,0.05)] border-b border-r border-slate-300' 
          : 'bg-gradient-to-br from-[#94a3b8] to-[#475569] border-t border-l border-slate-400 shadow-[inset_2px_2px_12px_rgba(0,0,0,0.3)] border-b border-r border-slate-700';
        selectedBg = 'bg-indigo-400/80 ring-2 ring-indigo-200 ring-inset shadow-[inset_0_0_15px_rgba(79,70,229,0.5)]';
        targetBg = 'bg-indigo-300/60 border-2 border-indigo-500';
        break;
    }

    const highlightLast = lastMove && (lastMove.from === getSquareName(r, c) || lastMove.to === getSquareName(r, c))
      ? 'ring-2 ring-violet-500/50 shadow-inner'
      : '';

    return `${isSelected ? selectedBg : isPossibleTarget ? targetBg : baseBg} ${highlightLast}`;
  };

  // Helper row-col name generator
  const getSquareName = (r: number, c: number): Square => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return (files[c] + ranks[r]) as Square;
  };

  // Coordinates array based on flip direction
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const gridRowIndices = playerColor === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const gridColIndices = playerColor === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 1, 2, 3, 4, 5, 6, 7]; // standard column files order

  return (
    <div className="relative w-full aspect-square max-w-[520px] mx-auto bg-black/40 p-3 rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Outer Check Alarm Indicator glow */}
      {isCheck && (
        <div className="absolute inset-0 pointer-events-none border-2 border-red-500/75 animate-pulse rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)_inset]" />
      )}

      {/* Internal interactive Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full relative z-10 gap-0.5 rounded-lg overflow-hidden">
        {gridRowIndices.map((r) =>
          gridColIndices.map((c) => {
            const squareKey = getSquareName(r, c);
            const piece = chess.get(squareKey);
            const isSelected = selectedSquare === squareKey;
            const isPossibleTarget = possibleMoves.includes(squareKey);

            return (
              <div
                key={squareKey}
                onClick={() => handleSquareClick(squareKey)}
                className={`relative flex items-center justify-center transition-all duration-300
                  ${((r + c) % 2 === 0) ? 'bg-neutral-800/80' : 'bg-neutral-900/80'}
                  ${isSelected ? 'bg-emerald-500/30 border-2 border-emerald-400 z-10 scale-105 shadow-xl' : 'hover:bg-white/10'}
                  ${isPossibleTarget && !piece ? 'after:content-[""] after:w-3 after:h-3 after:rounded-full after:bg-emerald-500/50' : ''}
                  ${isPossibleTarget && piece ? 'after:content-[""] after:absolute after:inset-0 after:border-4 after:border-emerald-500/50 after:rounded-full' : ''}
                  ${squareKey === chess.history({ verbose: true }).pop()?.to || squareKey === chess.history({ verbose: true }).pop()?.from ? 'bg-amber-500/20' : ''}
                  ${isCheck && piece && piece.type === 'k' && piece.color === chess.turn() ? 'bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : ''}
                `}
              >
                {/* Coordinates for edge squares */}
                {c === 0 && (
                  <span className="absolute top-1 left-1 text-[8px] font-mono text-white/30 pointer-events-none">
                    {8 - r}
                  </span>
                )}
                {r === 7 && (
                  <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-white/30 uppercase pointer-events-none">
                    {String.fromCharCode(97 + c)}
                  </span>
                )}
                
                {piece && (
                  <div className={`relative w-4/5 h-4/5 transition-transform duration-300 ${isSelected ? 'scale-110 drop-shadow-2xl' : 'drop-shadow-lg'}`}>
                    <ChessPieceSVG type={piece.type as any} color={piece.color} theme={theme} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
