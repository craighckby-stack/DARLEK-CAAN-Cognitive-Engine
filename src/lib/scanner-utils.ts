export const isCriticalFile = (path: string): boolean => {
  const criticalExtensions = ['.ts', '.tsx', '.js', '.jsx', '.md', '.json', '.config'];
  return criticalExtensions.some(ext => path.endsWith(ext));
};

export const formatScanMetrics = (files: any[]) => ({
  count: files.length,
  totalSize: files.reduce((acc, f) => acc + (f.size || 0), 0)
});