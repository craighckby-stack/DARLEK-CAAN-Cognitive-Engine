'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 text-center font-mono bg-black text-white min-h-[50vh] flex flex-col items-center justify-center">
      <div className="max-w-md border border-red-900 p-6 rounded bg-neutral-950">
        <h2 className="text-red-500 font-bold mb-2">SYSTEM ERROR</h2>
        <p className="text-xs text-gray-400 mb-4">{error?.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => reset()}
          className="px-3 py-1 bg-red-950 hover:bg-red-900 border border-red-700 text-xs rounded text-red-200"
        >
          Reset View
        </button>
      </div>
    </div>
  );
}
