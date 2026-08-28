import React, { memo } from 'react';

export type DalekStatus = 'connected' | 'offline' | string;

export interface DalekStatusIndicatorProps {
  readonly status: DalekStatus;
  readonly className?: string;
}

const STATUS_CONFIG = {
  connected: {
    text: '● SECURE',
    className: 'text-green-500',
  },
  offline: {
    text: '○ OFFLINE',
    className: 'text-red-500',
  },
} as const;

export const DalekStatusIndicator: React.FC<DalekStatusIndicatorProps> = memo(({ 
  status, 
  className = '' 
}) => {
  const isConnected = status === 'connected';
  const config = isConnected ? STATUS_CONFIG.connected : STATUS_CONFIG.offline;

  return (
    <div 
      className={`text-[10px] uppercase tracking-widest ${config.className} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={`Dalek status: ${status}`}
    >
      {config.text}
    </div>
  );
});

DalekStatusIndicator.displayName = 'DalekStatusIndicator';