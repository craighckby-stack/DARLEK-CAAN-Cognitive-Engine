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
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [filesScanned, setFilesScanned] = useState(0);
  const [filesSkipped, setFilesSkipped] = useState(0);
  const [scanDuration, setScanDuration] = useState(0);
  const startTime = useRef<number>(0);
  const timerRef = useRef<any>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isScanning) {
      timerRef.current = setInterval(() => {
        if (startTime.current > 0) {
          setScanDuration(Math.floor((Date.now() - startTime.current) / 1000));
        }
      }, 500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isScanning]);

  const stopScan = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setIsScanning(false);
    setStatusMessage('Scan aborted by user.');
  }, []);

  const scanFileList = useCallback(async (fileList: File[]) => {
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

      if (isSkippableFile(relPath)) {
        skipped++;
        setFilesSkipped(skipped);
        setProgress(Math.round(((i + 1) / fileList.length) * 100));
        continue;
      }

      if (file.size > MAX_SIZE) {
        skipped++;
        setFilesSkipped(skipped);
        setProgress(Math.round(((i + 1) / fileList.length) * 100));
        continue;
      }

      try {
        const text = await file.text();
        // Check for binary content (null bytes)
        if (text.slice(0, 1000).includes('\0')) {
          skipped++;
          setFilesSkipped(skipped);
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
      // Give UI loop a breather every 20 files
      if (i % 20 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    setIsScanning(false);
    setStatusMessage(`Scan complete. Found ${newResults.reduce((acc, r) => acc + r.findings.length, 0)} secrets across ${newResults.length} files.`);
  }, []);

  const downloadSanitizedZip = useCallback(async () => {
    if (results.length === 0) return;
    const zip = new JSZip();
    results.forEach((res) => {
      zip.file(res.file, res.sanitized);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanitized-project-${Date.now()}.zip`;
    a.click();
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
