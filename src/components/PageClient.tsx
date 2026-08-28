'use client';

import { useState, useEffect, memo, type JSX } from 'react';
import MainPage from '@/components/MainPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/**
 * Fallback loading component rendered during client-side hydration phase.
 * Optimized with memoization to prevent unnecessary re-renders.
 */
const HydrationFallback = memo((): JSX.Element => (
  <div
    className="min-h-screen flex items-center justify-center font-mono text-xs"
    style={{ background: '#030101', color: '#00ffcc' }}
    role="status"
    aria-label="Initializing Cognitive Dominance Engine"
  >
    <div className="flex items-center gap-2 animate-pulse">
      <span>[DARLEK CAAN] INITIALIZING COGNITIVE DOMINANCE ENGINE...</span>
    </div>
  </div>
));

HydrationFallback.displayName = 'HydrationFallback';

/**
 * PageClient manages client-side mounting state safely to prevent hydration mismatches
 * while wrapping the core application within an error boundary.
 */
export default function PageClient(): JSX.Element {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect((): void => {
    setMounted(true);
  }, []);

  return (
    <ErrorBoundary>
      {mounted ? <MainPage /> : <HydrationFallback />}
    </ErrorBoundary>
  );
}