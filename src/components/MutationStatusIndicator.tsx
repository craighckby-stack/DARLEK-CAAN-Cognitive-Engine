import React, { memo } from 'react';

export type MutationStatus = 'pending' | 'evolving' | 'stable';

export interface MutationStatusIndicatorProps {
  readonly status: MutationStatus;
  readonly className?: string;
}

interface StatusConfigEntry {
  readonly dot: string;
  readonly label: string;
}

const STATUS_CONFIG: Record<MutationStatus, StatusConfigEntry> = {
  pending: {
    dot: 'bg-yellow-500',
    label: 'pending',
  },
  evolving: {
    dot: 'animate-pulse bg-cyan-500',
    label: 'evolving',
  },
  stable: {
    dot: 'bg-green-500',
    label: 'stable',
  },
} as const;

export const MutationStatusIndicator: React.FC<MutationStatusIndicatorProps> = memo(({
  status,
  className = '',
}) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.stable;

  return (
    <div 
      className={`flex items-center gap-1 px-2 py-1 rounded bg-black border border-white/10 ${className}`}
      role="status"
      aria-label={`Mutation status: ${status}`}
    >
      <div 
        className={`w-2 h-2 rounded-full ${config.dot}`} 
        aria-hidden="true" 
      />
      <span className="text-[8px] uppercase tracking-widest text-white select-none">
        {config.label}
      </span>
    </div>
  );
});

MutationStatusIndicator.displayName = 'MutationStatusIndicator';