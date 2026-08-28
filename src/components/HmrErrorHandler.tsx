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

interface ErrorObject {
  message?: unknown;
  name?: unknown;
}

export default function HmrErrorHandler(): null {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent): void => {
      const { reason } = event;
      
      let message = '';
      let name = '';

      if (typeof reason === 'string') {
        message = reason;
      } else if (reason !== null && typeof reason === 'object') {
        const errObj = reason as ErrorObject;
        if (typeof errObj.message === 'string') {
          message = errObj.message;
        }
        if (typeof errObj.name === 'string') {
          name = errObj.name;
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