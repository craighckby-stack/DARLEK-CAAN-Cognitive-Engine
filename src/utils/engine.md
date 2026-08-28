# Engine Architecture: DARLEK-CANN-CHESS

## Overview
This module implements a high-performance Minimax-based AI engine utilizing Alpha-Beta pruning. It is explicitly optimized for the **CAAN** (Chaotic/Aggressive) and **JESUS** (Serene/Community) dynamic personality matrices.

## Technical Workflow
1. **Input Acquisition**: Parses the incoming FEN (Forsyth-Edwards Notation) string and sets the corresponding difficulty level.
2. **Heuristic Evaluation**: Combines standard Piece-Square Tables (PSTs) with runtime personality-specific weight adjustments.
3. **Search Algorithm**: Executes a recursive Minimax search optimized via Alpha-Beta pruning and move ordering heuristics (prioritizing captures).
4. **Output Generation**: Returns the optimal move in standard SAN (Standard Algebraic Notation) or LAN (Long Algebraic Notation) format.

## Integration & Performance
- **Brain Interface**: Fully modular and extendable via the `BrainType` abstraction interface.
- **UI Responsiveness**: Utilizes a constrained depth-limited search (depths 1–3) to prevent UI thread blocking and ensure seamless user interaction.

```typescript
// Example integration of the Brain Interface
interface EngineConfig {
  brainType: BrainType;
  depth: number;
  personality: 'CAAN' | 'JESUS';
}

function initializeEngine(config: EngineConfig): void {
  // Engine bootstrap implementation
}
```