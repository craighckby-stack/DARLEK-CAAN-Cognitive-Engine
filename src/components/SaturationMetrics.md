# SaturationMetrics Component Architecture

## Overview
Part of the `unitary-core` diagnostic suite. Monitors real-time cognitive load and structural integrity of the agent swarm.

## Integration
- **Inputs**: `SaturationMetrics` interface from `@/lib/types`.
- **Visuals**: Uses `Tailwind` + `Lucide-React` for high-contrast, low-latency UI feedback.
- **Logic**: Implements memoized state derivation to prevent unnecessary re-renders during high-frequency data updates.

## Thresholds
- **Structural Change**: Max 5.0 (Warning: 3.5, Critical: 4.5)
- **Semantic Saturation**: Max 0.35 (Warning: 0.25, Critical: 0.32)
- **Identity Preservation**: Inverted logic (Lower is worse).