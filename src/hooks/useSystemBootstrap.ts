/**
 * @file useSystemBootstrap.ts
 * @module EMG/Core/Hooks
 * @description Sovereign-tier optimized hook for tracking system bootstrap lifecycle events.
 * Implements strict memory safety, zero-overhead event binding, and explicit type contracts.
 */

import { useEffect, useState, useCallback } from 'react';

/**
 * Custom event name defining the system bootstrap ready state trigger.
 */
const SYSTEM_READY_EVENT = 'system-ready' as const;

/**
 * Interface representing the return contract for useSystemBootstrap.
 */
export type UseSystemBootstrapReturn = boolean;

/**
 * Optimally manages and observes the system bootstrap readiness state via window events.
 * 
 * @returns {UseSystemBootstrapReturn} Boolean flag indicating system readiness.
 */
export const useSystemBootstrap = (): UseSystemBootstrapReturn => {
  const [isReady, setIsReady] = useState<boolean>(false);

  const handleReady = useCallback((): void => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    window.addEventListener(SYSTEM_READY_EVENT, handleReady, { passive: true });
    
    return () => {
      window.removeEventListener(SYSTEM_READY_EVENT, handleReady);
    };
  }, [handleReady]);

  return isReady;
};