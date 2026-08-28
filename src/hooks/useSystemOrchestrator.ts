import { useState, useEffect, useRef, useCallback } from 'react';
import { SystemState } from '@/lib/types';

export interface UseSystemOrchestratorReturn {
  readonly isReady: boolean;
  readonly latency: number;
}

export const useSystemOrchestrator = (state: SystemState): UseSystemOrchestratorReturn => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [latency, setLatency] = useState<number>(0);
  
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleHandshake = useCallback(() => {
    const start = performance.now();
    let timer: ReturnType<typeof setTimeout> | null = null;

    try {
      timer = setTimeout(() => {
        if (!isMountedRef.current) return;
        const computedLatency = performance.now() - start;
        setLatency(computedLatency);
        setIsReady(true);
      }, 150);
    } catch (error) {
      if (isMountedRef.current) {
        setIsReady(false);
        setLatency(0);
      }
      console.error('EMG Core v49: Handshake execution failure', error);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    const cleanup = handleHandshake();
    return cleanup;
  }, [state.evolutionCycle, handleHandshake]);

  return { isReady, latency };
};