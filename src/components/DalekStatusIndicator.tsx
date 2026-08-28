import React, { memo, useMemo } from 'react';

export type DalekStatus = 'connected' | 'offline' | (string & {});

export interface DalekStatusIndicatorProps {
  readonly status: DalekStatus;
  readonly className?: string;
}

interface StatusConfigEntry {
  readonly text: string;
  readonly className: string;
}

const STATUS_CONFIG: Record<'connected' | 'offline', StatusConfigEntry> = {
  connected: {
    text: '● SECURE',
    className: 'text-green-500',
  },
  offline: {
    text: '○ OFFLINE',
    className: 'text-red-500',
  },
} as const;

const FALLBACK_CONFIG: StatusConfigEntry = {
  text: `○ ${String}`,
  className: 'text-yellow-500',
};

export const DalekStatusIndicator: React.FC<DalekStatusIndicatorProps> = memo(({ 
  status, 
  className = '' 
}) => {
  const config = useMemo<StatusConfigEntry>(() => {
    if (status === 'connected') return STATUS_CONFIG.connected;
    if (status === 'offline') return STATUS_CONFIG.offline;
    return {
      text: `○ ${status.toUpperCase()}`,
      className: 'text-yellow-500',
    };
  }, [status]);

  const computedClassName = useMemo(() => {
    return `text-[10px] uppercase tracking-widest ${config.className} ${className}`.trim();
  }, [config.className, className]);

  return (
    <div 
      className={computedClassName}
      role="status"
      aria-live="polite"
      aria-label={`Dalek status: ${status}`}
    >
      {config.text}
    </div>
  );
});

DalekStatusIndicator.displayName = 'DalekStatusIndicator';