'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const MainPage = dynamic(() => import('@/components/MainPage'), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-screen flex items-center justify-center font-mono text-xs"
      style={{ background: '#030101', color: '#00ffcc' }}
    >
      <div className="flex items-center gap-2 animate-pulse">
        <span>[DARLEK CAAN] SYNAPSE INJECTION IN PROGRESS...</span>
      </div>
    </div>
  ),
});

export default function PageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ErrorBoundary>
      {mounted ? (
        <MainPage />
      ) : (
        <div
          className="min-h-screen flex items-center justify-center font-mono text-xs"
          style={{ background: '#030101', color: '#00ffcc' }}
        >
          <div className="flex items-center gap-2 animate-pulse">
            <span>[DARLEK CAAN] INITIALIZING COGNITIVE DOMINANCE ENGINE...</span>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}
