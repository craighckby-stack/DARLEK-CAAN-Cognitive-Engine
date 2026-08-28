/**
 * @file src/lib/scanner-utils.ts
 * @module ScannerUtils
 * @description Optimized utility functions for file path classification and scan metrics aggregation.
 */

export interface ScannableFile {
  readonly size?: number;
  readonly [key: string]: unknown;
}

export interface ScanMetrics {
  readonly count: number;
  readonly totalSize: number;
}

/**
 * Precompiled Set of critical file extensions for $O(1)$ lookup performance.
 */
const CRITICAL_EXTENSIONS: ReadonlySet<string> = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.md',
  '.json',
  '.config',
]);

/**
 * Determines whether a given file path corresponds to a critical file type
 * based on its extension.
 *
 * @param {string} path - The file path to evaluate.
 * @returns {boolean} True if the file extension is recognized as critical.
 */
export const isCriticalFile = (path: string): boolean => {
  if (typeof path !== 'string' || path.length === 0) {
    return false;
  }

  // Find the last dot to extract the extension efficiently without regex overhead
  const lastDotIndex = path.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return false;
  }

  const ext = path.slice(lastDotIndex);
  return CRITICAL_EXTENSIONS.has(ext);
};

/**
 * Computes aggregate scan metrics for an array of scanned files with memory efficiency
 * and robust type safety.
 *
 * @template T
 * @param {readonly T[]} files - Array of file objects containing an optional size property.
 * @returns {ScanMetrics} An object containing the total file count and cumulative size.
 */
export const formatScanMetrics = <T extends ScannableFile>(files: readonly T[]): ScanMetrics => {
  if (!Array.isArray(files)) {
    return { count: 0, totalSize: 0 };
  }

  let totalSize = 0;
  const count = files.length;

  for (let i = 0; i < count; i++) {
    const size = files[i]?.size;
    if (typeof size === 'number' && size > 0) {
      totalSize += size;
    }
  }

  return {
    count,
    totalSize,
  };
};