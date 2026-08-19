# Engine Architecture: DARLEK-CANN-CHESS

## Overview
This module implements a Minimax-based AI engine with Alpha-Beta pruning, optimized for the 'CAAN' (Chaotic/Aggressive) and 'JESUS' (Serene/Community) personality matrices.

## Technical Workflow
1. **Input**: FEN string + Difficulty Level.
2. **Evaluation**: Piece-Square tables combined with personality-specific weightings.
3. **Search**: Recursive Minimax with move ordering (captures first).
4. **Output**: SAN/LAN move string.

## Integration
- **Brain Interface**: Extendable via `BrainType`.
- **Performance**: Depth-limited search (1-3) to ensure UI thread responsiveness.






































