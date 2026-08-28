import { useState, useCallback, useRef } from 'react';

export type OrchestraStatus = 'IDLE' | `EXECUTING_${string}`;

export interface UseAgentOrchestraReturn {
  readonly status: OrchestraStatus;
  readonly dispatch: (action: string) => void;
}

export const useAgentOrchestra = (): UseAgentOrchestraReturn => {
  const [status, setStatus] = useState<OrchestraStatus>('IDLE');
  const statusRef = useRef<OrchestraStatus>(status);
  statusRef.current = status;

  const dispatch = useCallback((action: string): void => {
    if (!action || typeof action !== 'string') {
      console.warn('[useAgentOrchestra] Invalid action dispatched');
      return;
    }
    const nextStatus: OrchestraStatus = `EXECUTING_${action}`;
    if (statusRef.current !== nextStatus) {
      setStatus(nextStatus);
    }
    // Logic for multi-tier LLM fallback integration
  }, []);

  return { status, dispatch };
};