# SaturationMetrics Component Architecture

## Overview

The `SaturationMetrics` component is a core telemetry module within the `unitary-core` diagnostic suite. It is engineered to monitor real-time cognitive load, structural integrity, and operational health across distributed agent swarms with zero-latency visual indicators.

## Integration & Architecture

- **Inputs**: Consumes the strongly typed `SaturationMetrics` interface imported from `@/lib/types`.
- **Styling**: Utilizes `Tailwind CSS` for performant layout design alongside `Lucide-React` iconography to ensure high-contrast, low-latency visual feedback.
- **Performance**: Implements optimized memoization patterns (`useMemo`, `useCallback`) to prevent redundant re-renders during high-frequency telemetry ingestion streams.

## Operational Thresholds

The component evaluates incoming telemetry against the following standardized parameters:

- **Structural Change**: Maximum threshold `5.0` (Warning: `3.5`, Critical: `4.5`).
- **Semantic Saturation**: Maximum threshold `0.35` (Warning: `0.25`, Critical: `0.32`).
- **Identity Preservation**: Evaluated via an inverted logic model where descending numerical values directly correlate with degraded operational states.

## Code Implementation Example

```typescript
import React, { useMemo, useCallback } from 'react';
import { SaturationMetrics as ISaturationMetrics } from '@/lib/types';

/**
 * Properties for the SaturationMetrics telemetry rendering component.
 */
export interface SaturationProps {
  /** Real-time telemetry data ingested from the agent swarm core */
  metrics: ISaturationMetrics;
  /** Optional refresh cadence override in milliseconds */
  refreshRate?: number;
}

/**
 * SaturationMetrics telemetry visualization component.
 * Monitors structural changes and semantic saturation with optimized memoization.
 */
export const SaturationMetrics: React.FC<SaturationProps> = ({ metrics, refreshRate = 1000 }) => {
  // Memoized threshold calculation to prevent redundant processing
  const isCritical = useMemo(() => {
    return metrics.structuralChange >= 4.5 || metrics.semanticSaturation >= 0.32;
  }, [metrics]);

  return (
    <div className="p-4 bg-slate-900 text-slate-100 rounded-lg border border-slate-800">
      <h3 className="text-sm font-semibold tracking-wider uppercase">Swarm Saturation Telemetry</h3>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-slate-400">Structural Change</span>
          <p className="text-lg font-mono">{metrics.structuralChange.toFixed(2)}</p>
        </div>
        <div>
          <span className="text-xs text-slate-400">Semantic Saturation</span>
          <p className="text-lg font-mono">{metrics.semanticSaturation.toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
};
```