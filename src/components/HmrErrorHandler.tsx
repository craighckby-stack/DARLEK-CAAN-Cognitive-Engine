'use client';

import { useEffect } from 'react';

const SUPPRESSED_ERROR_PATTERNS = [
  'hmr-client',
  'Failed to load chunk',
  'turbopack',
  'error.js',
  'global-error.js',
] as const;

const SUPPRESSED_ERROR_NAMES = new Set(['ChunkLoadError']);

export default function HmrErrorHandler(): null {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent): void => {
      const reason = event.reason;
      
      let message = '';
      let name = '';

      if (typeof reason === 'string') {
        message = reason;
      } else if (reason !== null && typeof reason === 'object') {
        if ('message' in reason && typeof (reason as Record<string, unknown>).message === 'string') {
          message = (reason as { message: string }).message;
        }
        if ('name' in reason && typeof (reason as Record<string, unknown>).name === 'string') {
          name = (reason as { name: string }).name;
        }
      }

      const isSuppressedName = SUPPRESSED_ERROR_NAMES.has(name);
      const isSuppressedMessage = SUPPRESSED_ERROR_PATTERNS.some((pattern) => 
        message.includes(pattern)
      );

      if (isSuppressedName || isSuppressedMessage) {
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