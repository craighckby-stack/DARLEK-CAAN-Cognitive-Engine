/**
 * @file src/lib/telemetry.ts
 * @description EMG Core v49 - Optimized Telemetry and Metrics Engine
 */

export interface EvolutionEventData {
  [key: string]: unknown;
}

export interface SaturationMetrics {
  [key: string]: number;
}

/**
 * Safely serializes and logs an evolution telemetry event.
 */
export const logEvolutionEvent = (event: string, data: EvolutionEventData): void => {
  let serialized: string;
  try {
    serialized = JSON.stringify(data) ?? 'null';
  } catch {
    serialized = '[Unserializable Data]';
  }
  console.log(`[EVOLUTION_EVENT][${new Date().toISOString()}] ${event}: ${serialized}`);
};

/**
 * Calculates the total saturation score from numeric metrics.
 */
export const calculateSaturationScore = (metrics: SaturationMetrics): number => {
  if (!metrics || typeof metrics !== 'object') {
    return 0;
  }
  
  let total = 0;
  const values = Object.values(metrics);
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (typeof val === 'number' && Number.isFinite(val)) {
      total += val;
    }
  }
  return total;
};