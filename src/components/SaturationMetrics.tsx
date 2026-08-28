'use client';

import React, { memo } from 'react';
import type { SaturationMetrics } from '@/lib/types';
import { COLORS, SATURATION_THRESHOLDS } from '@/lib/constants';
import { BarChart3 } from 'lucide-react';

export interface SaturationMetricsPanelProps {
  metrics: SaturationMetrics;
}

interface MetricConfig {
  readonly key: keyof SaturationMetrics;
  readonly label: string;
  readonly max: number;
  readonly warning: number;
  readonly critical: number;
  readonly format: (val: number) => string;
  readonly inverted?: boolean;
}

const METRIC_CONFIGS: readonly MetricConfig[] = [
  {
    key: 'structuralChange',
    label: 'STRUCTURAL CHANGE',
    max: SATURATION_THRESHOLDS.structuralChange.max,
    warning: SATURATION_THRESHOLDS.structuralChange.warning,
    critical: SATURATION_THRESHOLDS.structuralChange.critical,
    format: (v: number): string => `${v.toFixed(1)}/5`,
  },
  {
    key: 'semanticSaturation',
    label: 'SEMANTIC SATURATION',
    max: SATURATION_THRESHOLDS.semanticSaturation.max,
    warning: SATURATION_THRESHOLDS.semanticSaturation.warning,
    critical: SATURATION_THRESHOLDS.semanticSaturation.critical,
    format: (v: number): string => `${v.toFixed(3)}/0.35`,
  },
  {
    key: 'velocity',
    label: 'VELOCITY',
    max: SATURATION_THRESHOLDS.velocity.max,
    warning: SATURATION_THRESHOLDS.velocity.warning,
    critical: SATURATION_THRESHOLDS.velocity.critical,
    format: (v: number): string => `${v.toFixed(1)}/5`,
  },
  {
    key: 'identityPreservation',
    label: 'IDENTITY PRESERVATION',
    max: SATURATION_THRESHOLDS.identityPreservation.max,
    warning: SATURATION_THRESHOLDS.identityPreservation.warning,
    critical: SATURATION_THRESHOLDS.identityPreservation.critical,
    format: (v: number): string => `${v.toFixed(2)}/1`,
    inverted: true,
  },
  {
    key: 'capabilityAlignment',
    label: 'CAPABILITY ALIGNMENT',
    max: SATURATION_THRESHOLDS.capabilityAlignment.max,
    warning: SATURATION_THRESHOLDS.capabilityAlignment.warning,
    critical: SATURATION_THRESHOLDS.capabilityAlignment.critical,
    format: (v: number): string => `${v.toFixed(1)}/5`,
  },
  {
    key: 'crossFileImpact',
    label: 'CROSS-FILE IMPACT',
    max: SATURATION_THRESHOLDS.crossFileImpact.max,
    warning: SATURATION_THRESHOLDS.crossFileImpact.warning,
    critical: SATURATION_THRESHOLDS.crossFileImpact.critical,
    format: (v: number): string => `${v.toFixed(1)}/3`,
  },
] as const;

function getMetricColor(value: number, warning: number, critical: number, inverted?: boolean): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  if (inverted) {
    if (safeValue <= critical) return COLORS.dalekRed;
    if (safeValue <= warning) return COLORS.gold;
    return COLORS.cyan;
  }
  if (safeValue >= critical) return COLORS.dalekRed;
  if (safeValue >= warning) return COLORS.gold;
  return COLORS.cyan;
}

function getStatusLabel(value: number, warning: number, critical: number, inverted?: boolean): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  if (inverted) {
    if (safeValue <= critical) return '[CRITICAL]';
    if (safeValue <= warning) return '[WARNING]';
    return '[OK]';
  }
  if (safeValue >= critical) return '[OVER THRESHOLD]';
  if (safeValue >= warning) return '[WARNING]';
  return '[OK]';
}

function SaturationMetricsPanelComponent({ metrics }: SaturationMetricsPanelProps) {
  if (!metrics) {
    return (
      <div className="dalek-panel rounded-lg p-4 space-y-4">
        <div className="dalek-panel-header py-2 px-1 flex items-center gap-2">
          <BarChart3 size={14} style={{ color: COLORS.dalekRed }} />
          <span style={{ fontSize: '11px' }}>COGNITIVE DOMINANCE METRICS</span>
        </div>
        <div style={{ fontSize: '10px', color: COLORS.textMuted }}>NO METRICS DATA AVAILABLE</div>
      </div>
    );
  }

  return (
    <div className="dalek-panel rounded-lg p-4 space-y-4">
      <div className="dalek-panel-header py-2 px-1 flex items-center gap-2">
        <BarChart3 size={14} style={{ color: COLORS.dalekRed }} />
        <span style={{ fontSize: '11px' }}>COGNITIVE DOMINANCE METRICS</span>
      </div>

      <div className="space-y-3">
        {METRIC_CONFIGS.map((config) => {
          const rawValue = metrics[config.key];
          const value = typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : 0;
          const denominator = config.max > 0 ? config.max : 1;
          const percentage = Math.min(100, Math.max(0, (value / denominator) * 100));
          const barColor = getMetricColor(value, config.warning, config.critical, config.inverted);
          const statusLabel = getStatusLabel(value, config.warning, config.critical, config.inverted);

          return (
            <div key={config.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span 
                  style={{ 
                    fontSize: '8px', 
                    color: COLORS.textMuted, 
                    fontFamily: 'var(--font-orbitron), sans-serif', 
                    letterSpacing: '0.1em' 
                  }}
                >
                  {config.label}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontSize: '7px',
                      color: barColor,
                      fontFamily: 'var(--font-orbitron), sans-serif',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {statusLabel}
                  </span>
                  <span style={{ fontSize: '10px', color: barColor, fontWeight: 600 }}>
                    {config.format(value)}
                  </span>
                </div>
              </div>
              <div className="dalek-progress rounded-sm h-2">
                <div
                  className="dalek-progress-fill h-full rounded-sm transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: barColor,
                    boxShadow: `0 0 6px ${barColor}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const SaturationMetricsPanel = memo(SaturationMetricsPanelComponent);
export default SaturationMetricsPanel;