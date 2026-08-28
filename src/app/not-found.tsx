'use client';

import Link from 'next/link';
import type { JSX } from 'react';

export const dynamic = 'force-dynamic';

export default function NotFound(): JSX.Element {
  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black text-gray-200 font-mono"
      role="alert"
      aria-labelledby="not-found-title"
    >
      <div className="max-w-md w-full border border-red-900/50 bg-neutral-950 p-6 rounded-lg shadow-lg">
        <h1 id="not-found-title" className="text-xl font-bold text-red-500 mb-2">
          [404] ROUTE NOT FOUND
        </h1>
        <p className="text-xs text-gray-400 mb-6">
          The requested system node or route does not exist within the Dalek Caan architecture.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 text-xs font-semibold bg-red-950 hover:bg-red-900 border border-red-700 text-red-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Return to Command Console
        </Link>
      </div>
    </main>
  );
}