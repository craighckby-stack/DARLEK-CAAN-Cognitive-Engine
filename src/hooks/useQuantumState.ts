import { useState, useCallback, useMemo } from 'react';

export type QuantumState<T> = T & { readonly timestamp: number };
export type QuantumUpdater<T> = (prev: QuantumState<T>) => T;
export type UseQuantumStateReturn<T> = readonly [QuantumState<T>, (updater: QuantumUpdater<T>) => void];

export const useQuantumState = <T extends Record<string, unknown>>(initial: T): UseQuantumStateReturn<T> => {
  const [state, setState] = useState<QuantumState<T>>(() => ({
    ...initial,
    timestamp: Date.now(),
  }));

  const updateState = useCallback((updater: QuantumUpdater<T>) => {
    setState(prev => {
      try {
        const nextState = updater(prev);
        if (!nextState || typeof nextState !== 'object') {
          throw new Error('Quantum updater must return a valid object state.');
        }
        return {
          ...nextState,
          timestamp: Date.now(),
        } as QuantumState<T>;
      } catch (error) {
        console.error('[EMG Core v49] QuantumState Mutation Failure:', error);
        return prev;
      }
    });
  }, []);

  return useMemo(() => [state, updateState] as const, [state, updateState]);
};