# SaturationMetrics Component Architecture

## Overview
The `SaturationMetrics` component is an integral module of the `unitary-core` diagnostic suite, designed to monitor real-time cognitive load and structural integrity across the agent swarm.

## Integration & Architecture
- **Inputs**: Consumes the `SaturationMetrics` data interface imported from `@/lib/types`.
- **Visuals**: Styled using `Tailwind CSS` alongside `Lucide-React` icons to deliver high-contrast, low-latency UI feedback.
- **Logic**: Implements memoized state derivation patterns to prevent unnecessary re-renders during high-frequency telemetry updates.

## Operational Thresholds
- **Structural Change**: Max threshold `5.0` (Warning: `3.5`, Critical: `4.5`)
- **Semantic Saturation**: Max threshold `0.35` (Warning: `0.25`, Critical: `0.32`)
- **Identity Preservation**: Inverted logic model where lower numerical values represent degraded operational states.

```typescript
// Example telemetry consumption pattern
import { SaturationMetrics as ISaturationMetrics } from '@/lib/types';

interface SaturationProps {
  metrics: ISaturationMetrics;
}
```