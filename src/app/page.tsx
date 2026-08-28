import { JSX, Suspense } from 'react';
import PageClient from '@/components/PageClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';
export const revalidate = 0;

/**
 * Fallback skeleton for PageClient initial suspension boundary.
 * Optimized with explicit layout dimensions and minimal paint overhead.
 */
function PageLoadingSkeleton(): JSX.Element {
  return (
    <div 
      aria-hidden="true" 
      className="flex min-h-screen items-center justify-center bg-background"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

/**
 * Optimized root server page component for src/app/page.tsx.
 * Enforces strict type safety, memory efficiency, and robust Suspense boundaries.
 */
export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <PageClient />
    </Suspense>
  );
}