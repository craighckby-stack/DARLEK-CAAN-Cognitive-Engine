import { useState, useEffect } from 'react';
export const useSystemState = () => {
  const [systemState, setSystemState] = useState({ setupComplete: false, connectionStatus: 'idle' });
  useEffect(() => {
    const saved = localStorage.getItem('darlek_cann_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const timer = setTimeout(() => setSystemState(parsed), 0);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.error('Failed to parse darlek_cann_state:', e);
      }
    }
  }, []);
  const persist = (newState: any) => {
    setSystemState(newState);
    localStorage.setItem('darlek_cann_state', JSON.stringify(newState));
  };
  return { systemState, updateState: setSystemState, persist };
};