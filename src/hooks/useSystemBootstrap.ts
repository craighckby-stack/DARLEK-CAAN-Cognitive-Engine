import { useEffect, useState } from 'react';

export const useSystemBootstrap = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleReady = () => setIsReady(true);
    window.addEventListener('system-ready', handleReady);
    return () => window.removeEventListener('system-ready', handleReady);
  }, []);

  return isReady;
};






































