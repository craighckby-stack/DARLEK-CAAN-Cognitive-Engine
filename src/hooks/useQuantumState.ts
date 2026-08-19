import { useState, useCallback } from 'react';
export const useQuantumState = <T>(initial: T) => {
  const [state, setState] = useState<T>(initial);
  const updateState = useCallback((updater: (prev: T) => T) => {
    setState(prev => ({ ...updater(prev), timestamp: Date.now() }));
  }, []);
  return [state, updateState] as const;
};







































