import { useState, useRef, useCallback, useEffect } from 'react';
import { sanitizeContent, Finding, isSkippableFile } from '@/lib/scanner';
import JSZip from 'jszip';

export interface FolderScanFileResult {
  file: string;
  findings: Finding[];
  content: string;
  sanitized: string;
  size: number;
}

export function useFolderScanner() {
  const [results, setResults] = useState<FolderScanFileResult[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [filesScanned, setFilesScanned] = useState<number>(0);
  const [filesSkipped, setFilesSkipped] = useState<number>(0);
  const [scanDuration, setScanDuration] = useState<number>(0);

  const startTime = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isScanning) {
      timerRef.current = setInterval(() => {
        if (startTime.current > 0) {
          setScanDuration(Math.floor((Date.now() - startTime.current) / 1000));
        }
      }, 500);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isScanning]);

  const stopScan = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setIsScanning(false);
    setStatusMessage('Scan aborted by user.');
  }, []);

  const scanFileList = useCallback(async (fileList: File[]): Promise<void> => {
    setIsScanning(true);
    setResults([]);
    setProgress(0);
    setFilesScanned(0);
    setFilesSkipped(0);
    setScanDuration(0);
    setStatusMessage(`Preparing ${fileList.length} files for local scanning...`);
    startTime.current = Date.now();
    abortController.current = new AbortController();

    const newResults: FolderScanFileResult[] = [];
    let scanned = 0;
    let skipped = 0;
    const MAX_SIZE = 8 * 1024 * 1024; // 8MB

    for (let i = 0; i < fileList.length; i++) {
      if (abortController.current?.signal.aborted) break;

      const file = fileList[i];
      const relPath = file.webkitRelativePath || file.name;
      setCurrentFile(relPath);

      if (isSkippableFile(relPath) || file.size > MAX_SIZE) {
        skipped++;
        setFilesSkipped(skipped);
        setProgress(Math.round(((i + 1) / fileList.length) * 100));
        continue;
      }

      try {
        const text = await file.text();
        
        // Check for binary content (null bytes within first 1000 chars)
        if (text.slice(0, 1000).includes('\0')) {
          skipped++;
          setFilesSkipped(skipped);
          setProgress(Math.round(((i + 1) / fileList.length) * 100));
          continue;
        }

        const { sanitized, findings } = sanitizeContent(text);
        scanned++;
        setFilesScanned(scanned);

        if (findings.length > 0) {
          newResults.push({
            file: relPath,
            findings,
            content: text,
            sanitized,
            size: file.size,
          });
          setResults([...newResults]);
        }
      } catch (err) {
        console.error(`Failed to read file ${relPath}`, err);
        skipped++;
        setFilesSkipped(skipped);
      }

      setProgress(Math.round(((i + 1) / fileList.length) * 100));

      // Yield execution thread every 20 iterations to prevent UI freezing
      if (i % 20 === 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    }

    setIsScanning(false);
    const totalFindings = newResults.reduce((acc, r) => acc + r.findings.length, 0);
    setStatusMessage(`Scan complete. Found ${totalFindings} secrets across ${newResults.length} files.`);
  }, []);

  const downloadSanitizedZip = useCallback(async (): Promise<void> => {
    if (results.length === 0) return;
    const zip = new JSZip();
    for (const res of results) {
      zip.file(res.file, res.sanitized);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanitized-project-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [results]);

  return {
    results,
    isScanning,
    progress,
    currentFile,
    statusMessage,
    filesScanned,
    filesSkipped,
    scanDuration,
    scanFileList,
    stopScan,
    downloadSanitizedZip,
    setResults,
  };
}