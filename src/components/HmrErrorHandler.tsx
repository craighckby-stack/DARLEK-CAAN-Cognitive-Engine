'use client';

import { useEffect } from 'react';

export default function HmrErrorHandler() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const message = typeof reason === 'string' ? reason : reason?.message || '';
      const name = reason?.name || '';

      if (
        name === 'ChunkLoadError' ||
        message.includes('hmr-client') ||
        message.includes('Failed to load chunk') ||
        message.includes('turbopack') ||
        message.includes('error.js') ||
        message.includes('global-error.js')
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
