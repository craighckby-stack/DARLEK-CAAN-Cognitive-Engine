# EvolutionLog Component Documentation

## Overview
The `EvolutionLog` component serves as the primary telemetry interface for the DARLEK CANN v3.0 architecture. It visualizes chronological system mutations, agent state transitions, and error logs.

## Architectural Integration
- **Data Source**: Consumes `EvolutionLogEntry[]` from the central state management store.
- **Performance**: Utilizes `useMemo` for sorting and `useRef` for auto-scrolling to maintain 60fps during high-frequency log ingestion.
- **Styling**: Leverages Tailwind CSS with custom CSS variables defined in the global theme.

## Interface Declaration
typescript
interface EvolutionLogEntry {
  id: string;
  type: 'INFO' | 'CRITICAL' | 'EVOLUTION' | 'SECURITY';
  timestamp: number;
  description: string;
}


## Workflow
1. Log event triggered by Agent Orchestra.
2. State update propagates to `EvolutionLog`.
3. Component sorts by timestamp.
4. Auto-scroll triggers to keep latest event in view.