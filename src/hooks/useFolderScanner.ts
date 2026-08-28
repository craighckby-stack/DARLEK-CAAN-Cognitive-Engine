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

export interface UseFolderScannerReturn {
  results: FolderScanFileResult[];
  isScanning: boolean;
  progress: number;
  currentFile: string;
  statusMessage: string;
  filesScanned: number;
  filesSkipped: number;
  scanDuration: number;
  scanFileList: (fileList: File[]) => Promise<void>;
  stopScan: () => void;
  downloadSanitizedZip: () => Promise<void>;
  setResults: React.Dispatch<React.SetStateAction<FolderScanFileResult[]>>;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const TIMER_INTERVAL_MS = 500;
const YIELD_INTERVAL_ITERATIONS = 20;
const BINARY_CHECK_LENGTH = 1000;

export function useFolderScanner(): UseFolderScannerReturn {
  const [results, setResults] = useState<FolderScanFileResult[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [filesScanned, setFilesScanned] = useState<number>(0);
  const [filesSkipped, setFilesSkipped] = useState<number>(0);
  const [scanDuration, setScanDuration] = useState<number>(0);

  const startTime = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isScanning) {
      timerRef.current = setInterval(() => {
        if (startTime.current > 0) {
          setScanDuration(Math.floor((Date.now() - startTime.current) / 1000));
        }
      }, TIMER_INTERVAL_MS);
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

  const stopScan = useCallback((): void => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    setIsScanning(false);
    setStatusMessage('Scan aborted by user.');
  }, []);

  const scanFileList = useCallback(async (fileList: File[]): Promise<void> => {
    if (!Array.isArray(fileList) || fileList.length === 0) {
      setStatusMessage('No files provided for scanning.');
      return;
    }

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
    const totalFiles = fileList.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        if (abortController.current?.signal.aborted) {
          break;
        }

        const file = fileList[i];
        if (!file) continue;

        const relPath = file.webkitRelativePath || file.name;
        setCurrentFile(relPath);

        const progressPercent = Math.round(((i + 1) / totalFiles) * 100);

        if (isSkippableFile(relPath) || file.size > MAX_FILE_SIZE) {
          skipped++;
          setFilesSkipped(skipped);
          setProgress(progressPercent);
          continue;
        }

        try {
          const text = await file.text();
          
          if (text.slice(0, BINARY_CHECK_LENGTH).includes('\0')) {
            skipped++;
            setFilesSkipped(skipped);
            setProgress(progressPercent);
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
        } catch (fileErr) {
          console.error(`Failed to read file: ${relPath}`, fileErr);
          skipped++;
          setFilesSkipped(skipped);
        }

        setProgress(progressPercent);

        if (i > 0 && i % YIELD_INTERVAL_ITERATIONS === 0) {
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }
      }
    } catch (err) {
      console.error('Critical error during folder scan execution:', err);
      setStatusMessage('An unexpected error occurred during the scan.');
    } finally {
      setIsScanning(false);
      abortController.current = null;
      const totalFindings = newResults.reduce((acc, r) => acc + r.findings.length, 0);
      setStatusMessage(`Scan complete. Found ${totalFindings} secrets across ${newResults.length} files.`);
    }
  }, []);

  const downloadSanitizedZip = useCallback(async (): Promise<void> => {
    if (results.length === 0) return;
    
    try {
      const zip = new JSZip();
      for (const res of results) {
        if (res && res.file) {
          zip.file(res.file, res.sanitized);
        }
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
    } catch (err) {
      console.error('Failed to generate or download sanitized ZIP archive:', err);
    }
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