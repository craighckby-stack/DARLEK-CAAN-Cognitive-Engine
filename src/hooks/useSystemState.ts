import { useState, useEffect, useCallback } from 'react';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | string;

export interface SystemState {
  setupComplete: boolean;
  connectionStatus: ConnectionStatus;
  [key: string]: unknown;
}

const STORAGE_KEY = 'darlek_cann_state';

export const useSystemState = () => {
  const [systemState, setSystemState] = useState<SystemState>({
    setupComplete: false,
    connectionStatus: 'idle',
  });

  useEffect(() => {
    let isMounted = true;
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as unknown;
        if (parsed !== null && typeof parsed === 'object') {
          const timer = setTimeout(() => {
            if (isMounted) {
              setSystemState((prev) => ({ ...prev, ...(parsed as SystemState) }));
            }
          }, 0);
          return () => {
            isMounted = false;
            clearTimeout(timer);
          };
        }
      } catch (e) {
        console.error('Failed to parse darlek_cann_state:', e);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  const persist = useCallback((newState: SystemState | ((prevState: SystemState) => SystemState)) => {
    setSystemState((prevState) => {
      const resolvedState = typeof newState === 'function' ? newState(prevState) : newState;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedState));
      } catch (e) {
        console.error('Failed to persist darlek_cann_state:', e);
      }
      return resolvedState;
    });
  }, []);

  const updateState = useCallback((newState: SystemState | ((prevState: SystemState) => SystemState)) => {
    setSystemState(newState);
  }, []);

  return { systemState, updateState, persist };
};