'use client';

import React, { memo, useMemo } from 'react';
import type { EvolutionLogEntry } from '@/lib/types';
import { COLORS, LOG_TYPE_ICONS, LOG_TYPE_COLORS } from '@/lib/constants';
import { ScrollText } from 'lucide-react';

export interface EvolutionLogProps {
  entries: ReadonlyArray<EvolutionLogEntry>;
}

interface LogRowProps {
  readonly entry: EvolutionLogEntry;
}

const LogRow = memo(function LogRow({ entry }: LogRowProps) {
  const color = LOG_TYPE_COLORS[entry.type] ?? COLORS.textDim;
  const icon = LOG_TYPE_ICONS[entry.type] ?? '●';

  const formattedTime = useMemo(() => {
    try {
      return new Date(entry.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '00:00:00';
    }
  }, [entry.timestamp]);

  return (
    <div
      className="flex items-start gap-2 px-2 py-1.5 rounded-sm"
      style={{ background: '#060606' }}
    >
      <span
        style={{
          fontSize: '10px',
          flexShrink: 0,
          lineHeight: 1,
          color,
          width: '14px',
          textAlign: 'center',
        }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: '7px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-orbitron), sans-serif',
              color,
            }}
          >
            {entry.type}
          </span>
          <span
            style={{
              fontSize: '8px',
              color: COLORS.textMuted,
              fontFamily: 'var(--font-share-tech-mono), monospace',
            }}
          >
            {formattedTime}
          </span>
        </div>
        <p
          style={{
            fontSize: '10px',
            color: COLORS.textDim,
            lineHeight: 1.4,
            fontFamily: 'var(--font-share-tech-mono), monospace',
          }}
          className="truncate"
        >
          {entry.description}
        </p>
      </div>
    </div>
  );
});

export default function EvolutionLog({ entries }: EvolutionLogProps) {
  const entryCount = entries.length;

  return (
    <div
      className="dalek-panel rounded-lg p-4 space-y-3 flex flex-col"
      style={{ maxHeight: '280px' }}
    >
      <div className="dalek-panel-header py-2 px-1 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ScrollText size={14} style={{ color: COLORS.dalekRed }} />
          <span style={{ fontSize: '11px' }}>EVOLUTION LOG</span>
        </div>
        <span style={{ fontSize: '9px', color: COLORS.textMuted }}>
          {entryCount} EVENTS
        </span>
      </div>

      <div className="flex-1 overflow-y-auto dalek-scrollbar space-y-1 min-h-0">
        {entryCount === 0 ? (
          <div className="flex items-center justify-center py-6">
            <span
              style={{
                fontSize: '10px',
                color: COLORS.textMuted,
                fontFamily: 'var(--font-share-tech-mono), monospace',
              }}
            >
              No events recorded yet.
            </span>
          </div>
        ) : (
          entries.map((entry) => <LogRow key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}