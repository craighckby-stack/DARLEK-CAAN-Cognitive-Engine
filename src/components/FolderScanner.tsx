'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFolderScanner, FolderScanFileResult } from '@/hooks/useFolderScanner';
import { Finding } from '@/lib/scanner';
import { Folder, Upload, Shield, Play, Square, Download, Filter, Search, Eye, Copy, Check, X, FileCode, AlertTriangle, RefreshCw, Trash2, Archive } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

export default function FolderScanner() {
  const {
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
  } = useFolderScanner();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [activeFinding, setActiveFinding] = useState<{ finding: Finding; file: string; content?: string; sanitized?: string } | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'sanitized'>('sanitized');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  const flatFindings = useMemo(() => {
    const all: (Finding & { file: string; content?: string; sanitized?: string })[] = [];
    results.forEach((res: FolderScanFileResult) => {
      res.findings.forEach((f) => {
        all.push({ ...f, file: res.file, content: res.content, sanitized: res.sanitized });
      });
    });

    let filtered = all;
    if (severityFilter !== 'All') {
      filtered = filtered.filter((f) => f.severity === severityFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.file.toLowerCase().includes(lower) ||
          f.type.toLowerCase().includes(lower) ||
          f.snippet.toLowerCase().includes(lower)
      );
    }
    return filtered;
  }, [results, severityFilter, searchTerm]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      scanFileList(fileList);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files);
      scanFileList(fileList);
    }
  };

  const exportJSON = () => {
    const data = flatFindings.map(({ file, lineNum, type, severity, confidence, snippet, match }) => ({
      file,
      lineNum,
      type,
      severity,
      confidence,
      snippet,
      match,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folder-secret-scan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['File', 'Line', 'Type', 'Severity', 'Confidence', 'Snippet'];
    const rows = flatFindings.map((f) => [
      `"${f.file.replace(/"/g, '""')}"`,
      f.lineNum,
      `"${f.type.replace(/"/g, '""')}"`,
      `"${f.severity}"`,
      `"${f.confidence}"`,
      `"${f.snippet.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folder-secret-scan-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSARIF = () => {
    const sarif = {
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'FolderSecret-PII-Sanitizer',
              version: '2.0.0',
              rules: Array.from(new Set(flatFindings.map((f) => f.type))).map((type) => ({
                id: type.replace(/\s+/g, '-').toUpperCase(),
                name: type,
                shortDescription: { text: `Detected exposure of ${type}` },
                defaultConfiguration: { level: 'error' },
              })),
            },
          },
          results: flatFindings.map((f) => ({
            ruleId: f.type.replace(/\s+/g, '-').toUpperCase(),
            message: { text: `Potential sensitive ${f.type} found.` },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: { uri: f.file },
                  region: { startLine: f.lineNum },
                },
              },
            ],
          })),
        },
      ],
    };
    const blob = new Blob([JSON.stringify(sarif, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folder-secret-scan-${Date.now()}.sarif`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-600/50">CRITICAL</span>;
      case 'High':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50">HIGH</span>;
      case 'Medium':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-950/80 text-yellow-300 border border-yellow-600/50">MEDIUM</span>;
      case 'Low':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-600/50">LOW</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300">INFO</span>;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">HIGH CONF</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-400 border border-amber-500/30">MED CONF</span>;
      case 'low':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">LOW CONF</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-neutral-200 p-4 font-mono overflow-y-auto">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderSelect}
        // @ts-expect-error webkitdirectory is standard for folder picking
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={filesInputRef}
        onChange={handleFolderSelect}
        multiple
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-700/50 text-amber-400">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              Local Folder & Project Scanner
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                100% Client-Side / Zero Upload
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Drag & drop a repository folder or select directory to scan all files locally in your browser memory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={isScanning}
            className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Folder className="w-3.5 h-3.5" /> Select Directory
          </button>
          <button
            onClick={() => filesInputRef.current?.click()}
            disabled={isScanning}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 border border-neutral-700 transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" /> Select Files
          </button>
          {isScanning && (
            <button
              onClick={stopScan}
              className="px-3 py-1.5 rounded bg-rose-950 border border-rose-700 text-rose-300 text-xs flex items-center gap-1.5 hover:bg-rose-900 transition-colors"
            >
              <Square className="w-3.5 h-3.5" /> Stop Scan
            </button>
          )}
          {results.length > 0 && (
            <button
              onClick={downloadSanitizedZip}
              className="px-3 py-1.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-1.5 hover:bg-emerald-900 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" /> Download Sanitized ZIP
            </button>
          )}
        </div>
      </div>

      {/* Drag & Drop Zone (if not scanning and no results, or always available) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => folderInputRef.current?.click()}
        className={`my-4 p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
          isDragOver
            ? 'border-amber-500 bg-amber-950/20 text-amber-200'
            : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 text-neutral-400'
        }`}
      >
        <Upload className="w-8 h-8 text-neutral-500" />
        <div className="text-xs font-semibold text-neutral-200">
          Drop your codebase folder or multi-file selection here
        </div>
        <div className="text-[11px] text-neutral-500">
          Scanned purely inside browser Web Workers & Memory — no files are transmitted to any server.
        </div>
      </div>

      {/* Progress & Live Status Bar */}
      {isScanning && (
        <div className="mb-4 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin" /> Scanning: {currentFile}
            </span>
            <span className="text-neutral-400">{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">Files Scanned</div>
          <div className="text-lg font-bold text-neutral-200">{filesScanned}</div>
        </div>
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">Files Skipped</div>
          <div className="text-lg font-bold text-neutral-400">{filesSkipped}</div>
        </div>
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">Total Findings</div>
          <div className="text-lg font-bold text-rose-400">{flatFindings.length}</div>
        </div>
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">Files with Secrets</div>
          <div className="text-lg font-bold text-amber-400">{results.length}</div>
        </div>
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">Scan Duration</div>
          <div className="text-lg font-bold text-neutral-300">{scanDuration}s</div>
        </div>
      </div>

      {/* Filter & Export Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-950 rounded-lg border border-neutral-800 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by file path, secret type, or code snippet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-neutral-200 outline-none placeholder:text-neutral-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
            <Filter className="w-3 h-3 text-neutral-500" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-xs text-neutral-300 outline-none cursor-pointer"
            >
              <option value="All" className="bg-neutral-900">All Severities</option>
              <option value="Critical" className="bg-neutral-900">Critical</option>
              <option value="High" className="bg-neutral-900">High</option>
              <option value="Medium" className="bg-neutral-900">Medium</option>
              <option value="Low" className="bg-neutral-900">Low</option>
            </select>
          </div>

          {flatFindings.length > 0 && (
            <>
              <button
                onClick={exportJSON}
                className="text-xs px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 transition-colors"
              >
                Export JSON
              </button>
              <button
                onClick={exportCSV}
                className="text-xs px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={exportSARIF}
                className="text-xs px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 transition-colors"
              >
                Export SARIF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Findings List */}
      <div className="rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden flex-1">
        <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-200">
            Detected Findings ({flatFindings.length})
          </span>
          {statusMessage && <span className="text-[11px] text-neutral-400">{statusMessage}</span>}
        </div>

        {flatFindings.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            {filesScanned === 0
              ? 'Select a folder or drag files above to begin scanning.'
              : 'Scan complete. No sensitive patterns matched current criteria.'}
          </div>
        ) : (
          <div className="divide-y divide-neutral-900 max-h-[500px] overflow-y-auto">
            {flatFindings.map((f, idx) => (
              <div
                key={idx}
                className="p-3 hover:bg-neutral-900/50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex flex-col gap-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(f.severity)}
                    {getConfidenceBadge(f.confidence)}
                    <span className="font-semibold text-neutral-200">{f.type}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono">
                    <FileCode className="w-3 h-3 text-neutral-500" />
                    <span>{f.file}</span>
                    <span className="text-neutral-600">:</span>
                    <span className="text-amber-400">L{f.lineNum}</span>
                  </div>
                </div>

                <div className="flex-1 max-w-xl text-neutral-400 truncate font-mono bg-black/40 px-2 py-1 rounded border border-neutral-900">
                  <span className="text-neutral-500">Snippet: </span>
                  <span className="text-neutral-300">{f.snippet}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveFinding({ finding: f, file: f.file, content: f.content, sanitized: f.sanitized })}
                    className="text-xs px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1 border border-neutral-700 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View Diff
                  </button>
                  <button
                    onClick={() => copyToClipboard(f.match, `match-folder-${idx}`)}
                    className="text-xs px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
                  >
                    {copiedKey === `match-folder-${idx}` ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File Diff Modal */}
      {activeFinding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono">
            <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-neutral-200">{activeFinding.file}</span>
                <span className="text-[11px] text-neutral-500">Line {activeFinding.finding.lineNum}</span>
              </div>
              <button
                onClick={() => setActiveFinding(null)}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('sanitized')}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    viewMode === 'sanitized'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Sanitized (Safe)
                </button>
                <button
                  onClick={() => setViewMode('original')}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    viewMode === 'original'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Original (Raw)
                </button>
              </div>

              <button
                onClick={() =>
                  copyToClipboard(
                    viewMode === 'sanitized' ? activeFinding.sanitized || '' : activeFinding.content || '',
                    'modal-copy'
                  )
                }
                className="text-xs px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1.5 border border-neutral-700 transition-colors"
              >
                {copiedKey === 'modal-copy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'modal-copy' ? 'Copied' : 'Copy View Code'}
              </button>
            </div>

            <div className="flex-1 overflow-auto max-h-[500px]">
              <CodeMirror
                value={
                  viewMode === 'sanitized'
                    ? activeFinding.sanitized || ''
                    : activeFinding.content || ''
                }
                extensions={[javascript({ jsx: true, typescript: true })]}
                theme="dark"
                readOnly={true}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  highlightActiveLine: false,
                }}
                style={{ fontSize: '12px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
