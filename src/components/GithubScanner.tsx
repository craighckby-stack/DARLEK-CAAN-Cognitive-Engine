import React, { useState, useMemo } from 'react';
import { useGithubScanner, ScanResult } from '@/hooks/useGithubScanner';
import { Shield, Play, Square, Download, Filter, Search, Eye, Copy, Check, X, FileCode, AlertTriangle, ArrowRight, Settings, Key, RefreshCw, Trash2, GitCommit, Folder, FileText } from 'lucide-react';
import { Finding } from '@/lib/scanner';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import SnippetScanner from '@/components/SnippetScanner';
import FolderScanner from '@/components/FolderScanner';

interface GithubScannerProps {
  token?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  onFileClick?: (file: string) => void;
}

export default function GithubScanner({ token: initialToken, owner: initialOwner, repo: initialRepo, branch: initialBranch, onFileClick }: GithubScannerProps) {
  const { results, isScanning, progress, currentFile, statusMessage, startScan, stopScan, filesScanned, filesSkipped, scanDuration } = useGithubScanner();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [scannerMode, setScannerMode] = useState<'github' | 'folder' | 'snippet'>('github');
  
  // Editable Target Configuration
  const [activeOwner, setActiveOwner] = useState(initialOwner || 'craighckby-stack');
  const [activeRepo, setActiveRepo] = useState(initialRepo || 'AI_Agent_OS');
  const [activeBranch, setActiveBranch] = useState(initialBranch || 'main');
  const [activeToken, setActiveToken] = useState(initialToken || '');
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  
  // Purge Modal State
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeConfirmText, setPurgeConfirmText] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  
  // Sync if initial props change
  React.useEffect(() => {
    if (initialOwner) setActiveOwner(initialOwner);
    if (initialRepo) setActiveRepo(initialRepo);
    if (initialBranch) setActiveBranch(initialBranch);
    if (initialToken) setActiveToken(initialToken);
  }, [initialOwner, initialRepo, initialBranch, initialToken]);

  // Selected finding/file detail modal state
  const [activeFinding, setActiveFinding] = useState<{ finding: Finding; file: string; content?: string; sanitized?: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'sanitized'>('original');

  const handleStart = (customToken?: string, customOwner?: string, customRepo?: string, customBranch?: string) => {
    const o = (customOwner !== undefined ? customOwner : activeOwner).trim();
    const r = (customRepo !== undefined ? customRepo : activeRepo).trim();
    const b = (customBranch !== undefined ? customBranch : activeBranch).trim() || 'main';
    const t = (customToken !== undefined ? customToken : activeToken).trim();

    if (!o || !r) {
      alert("Please provide both a GitHub Owner/Organization and Repository name to scan.");
      return;
    }
    startScan(t, o, r, b);
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Critical': return 'bg-rose-600/20 text-rose-400 border border-rose-500/40';
      case 'High': return 'bg-amber-600/20 text-amber-400 border border-amber-500/40';
      case 'Medium': return 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/40';
      case 'Low': return 'bg-blue-600/20 text-blue-400 border border-blue-500/40';
      default: return 'bg-gray-700/20 text-gray-300 border border-gray-600/40';
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch(confidence) {
      case 'high': return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">HIGH CONF</span>;
      case 'medium': return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30">MED CONF</span>;
      case 'low': return <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">LOW CONF</span>;
      default: return null;
    }
  };

  const flatFindings = useMemo(() => {
    const all: (Finding & { file: string; content?: string; sanitized?: string })[] = [];
    results.forEach((res: ScanResult) => {
      res.findings.forEach(f => {
        all.push({ ...f, file: res.file, content: res.content, sanitized: res.sanitized });
      });
    });
    
    let filtered = all;
    if (severityFilter !== 'All') {
      filtered = filtered.filter(f => f.severity === severityFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(f => f.file.toLowerCase().includes(lower) || f.type.toLowerCase().includes(lower) || f.snippet.toLowerCase().includes(lower));
    }
    return filtered;
  }, [results, severityFilter, searchTerm]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const exportJSON = () => {
    const data = flatFindings.map(({ file, lineNum, type, severity, confidence, snippet, match }) => ({
      file, lineNum, type, severity, confidence, snippet, match
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secret-scan-${activeOwner}-${activeRepo}.json`;
    a.click();
  };

  const exportCSV = () => {
    const headers = ['File', 'Line', 'Type', 'Severity', 'Confidence', 'Snippet'];
    const rows = flatFindings.map(f => [
      `"${f.file.replace(/"/g, '""')}"`,
      f.lineNum,
      `"${f.type.replace(/"/g, '""')}"`,
      `"${f.severity}"`,
      `"${f.confidence}"`,
      `"${f.snippet.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secret-scan-${activeOwner}-${activeRepo}.csv`;
    a.click();
  };

  const exportSARIF = () => {
    const sarif = {
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [{
        tool: {
          driver: {
            name: 'GitSecret-PII-Sanitizer',
            version: '2.0.0',
            rules: Array.from(new Set(flatFindings.map(f => f.type))).map(type => ({
              id: type.replace(/\s+/g, '-').toUpperCase(),
              name: type,
              shortDescription: { text: `Detected exposure of ${type}` },
              defaultConfiguration: { level: 'error' }
            }))
          }
        },
        results: flatFindings.map(f => ({
          ruleId: f.type.replace(/\s+/g, '-').toUpperCase(),
          message: { text: `Potential sensitive ${f.type} found.` },
          locations: [{
            physicalLocation: {
              artifactLocation: { uri: f.file },
              region: { startLine: f.lineNum }
            }
          }]
        }))
      }]
    };
    const blob = new Blob([JSON.stringify(sarif, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secret-scan-${activeOwner}-${activeRepo}.sarif`;
    a.click();
  };

  const generatePurgeScript = () => {
    if (purgeConfirmText !== 'DELETE') return;
    
    // Collect unique regex to replacement pairs
    const replacements = new Set<string>();
    flatFindings.forEach(f => {
      const placeholder = `<${f.type.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_REDACTED>`;
      replacements.add(`${f.match}==>${placeholder}`);
    });
    
    const replacementsContent = Array.from(replacements).join('\n');
    
    const script = `#!/bin/bash
# 1. Create rules file
cat << 'EOF' > replacements.txt
${replacementsContent}
EOF

# 2. Run filter-repo
git filter-repo --replace-text replacements.txt --force

# 3. Clean up
rm replacements.txt
echo "History rewritten. You can now force push."
echo "git push origin --force --all"
`;

    // Download replacements.txt
    const blob1 = new Blob([replacementsContent], { type: 'text/plain' });
    const a1 = document.createElement('a');
    a1.href = URL.createObjectURL(blob1);
    a1.download = 'replacements.txt';
    a1.click();
    
    // Download script.sh
    const blob2 = new Blob([script], { type: 'text/x-sh' });
    const a2 = document.createElement('a');
    a2.href = URL.createObjectURL(blob2);
    a2.download = 'purge-history.sh';
    setTimeout(() => a2.click(), 500);

    setShowPurgeModal(false);
    setPurgeConfirmText('');
  };

  const commitSanitizedFile = async () => {
    if (!activeFinding || !activeFinding.sanitized || !activeToken) {
      alert("GitHub token is required to commit fixes.");
      return;
    }
    setIsCommitting(true);
    try {
      const commitMessage = `fix(security): redact exposed ${activeFinding.finding.type} in ${activeFinding.file}`;

      const res = await fetch('/api/github/write-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: activeToken,
          owner: activeOwner,
          repo: activeRepo,
          branch: activeBranch || 'main',
          path: activeFinding.file,
          content: activeFinding.sanitized,
          commitMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Commit failed');
      }

      alert(`Successfully committed sanitized file to GitHub (${activeOwner}/${activeRepo}@${activeBranch || 'main'})!\nCommit SHA: ${data.commitSha?.slice(0, 7) || 'success'}`);
      setActiveFinding(null);
    } catch (e: any) {
      alert(`Commit error: ${e.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCardClick = (f: Finding & { file: string; content?: string; sanitized?: string }) => {
    setActiveFinding({
      finding: f,
      file: f.file,
      content: f.content,
      sanitized: f.sanitized
    });
    if (onFileClick) {
      onFileClick(f.file);
    }
  };

  const isErrorState = Boolean(statusMessage && statusMessage.toLowerCase().includes('failed'));

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] text-gray-200 font-sans p-4 space-y-4 overflow-hidden relative">
      {/* Top Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-black/80 border border-gray-800 rounded-lg shrink-0 font-mono text-xs">
        <button
          type="button"
          onClick={() => setScannerMode('github')}
          className={`flex-1 py-1.5 px-3 rounded-md flex items-center justify-center gap-2 font-semibold transition-all ${
            scannerMode === 'github'
              ? 'bg-rose-950/70 text-rose-300 border border-rose-600/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'
          }`}
        >
          <GitCommit size={14} className={scannerMode === 'github' ? 'text-rose-400' : 'text-gray-500'} />
          <span>GitHub Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => setScannerMode('folder')}
          className={`flex-1 py-1.5 px-3 rounded-md flex items-center justify-center gap-2 font-semibold transition-all ${
            scannerMode === 'folder'
              ? 'bg-amber-950/70 text-amber-300 border border-amber-600/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'
          }`}
        >
          <Folder size={14} className={scannerMode === 'folder' ? 'text-amber-400' : 'text-gray-500'} />
          <span>Local Folder / Files</span>
        </button>

        <button
          type="button"
          onClick={() => setScannerMode('snippet')}
          className={`flex-1 py-1.5 px-3 rounded-md flex items-center justify-center gap-2 font-semibold transition-all ${
            scannerMode === 'snippet'
              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-600/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'
          }`}
        >
          <FileText size={14} className={scannerMode === 'snippet' ? 'text-emerald-400' : 'text-gray-500'} />
          <span>Code Snippet</span>
        </button>
      </div>

      {scannerMode === 'folder' ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <FolderScanner />
        </div>
      ) : scannerMode === 'snippet' ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <SnippetScanner />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800/80 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Shield size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-wider text-rose-400 uppercase font-mono">
                PII & Secret Security Scanner
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 font-mono">
                v2.0 Realtime
              </span>
            </div>
            
            {/* Target Display & Inline Quick Editor */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1">
              <span className="text-gray-500 font-mono">Target:</span>
              <div className="flex items-center bg-black/60 border border-gray-800 rounded px-2 py-0.5 gap-1.5 font-mono text-[11px]">
                <input
                  type="text"
                  value={activeOwner}
                  onChange={(e) => setActiveOwner(e.target.value)}
                  placeholder="owner"
                  disabled={isScanning}
                  className="bg-transparent text-gray-200 w-28 focus:outline-none focus:text-white"
                  title="Repository Owner or Organization"
                />
                <span className="text-gray-600">/</span>
                <input
                  type="text"
                  value={activeRepo}
                  onChange={(e) => setActiveRepo(e.target.value)}
                  placeholder="repository"
                  disabled={isScanning}
                  className="bg-transparent text-cyan-300 font-semibold w-28 focus:outline-none focus:text-white"
                  title="Repository Name"
                />
                <span className="text-gray-600">@</span>
                <input
                  type="text"
                  value={activeBranch}
                  onChange={(e) => setActiveBranch(e.target.value)}
                  placeholder="branch"
                  disabled={isScanning}
                  className="bg-transparent text-rose-300 w-16 focus:outline-none focus:text-white"
                  title="Branch or Commit SHA"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                className={`p-1 rounded border text-[11px] flex items-center gap-1 transition-colors ${
                  showConfigDrawer 
                    ? 'bg-rose-950/40 text-rose-300 border-rose-500/50' 
                    : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:text-gray-200'
                }`}
                title="Toggle Advanced Target & Token Settings"
              >
                <Settings size={12} />
                <span className="font-mono text-[10px]">Config</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isScanning ? (
            <button
              onClick={() => handleStart()}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2 rounded text-sm font-medium transition-all shadow-lg shadow-rose-950/40 cursor-pointer"
            >
              <Play size={15} fill="currentColor" /> Start Repository Scan
            </button>
          ) : (
            <button
              onClick={stopScan}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-rose-400 border border-rose-500/40 px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
            >
              <Square size={15} fill="currentColor" /> Stop Scan
            </button>
          )}
        </div>
      </div>

      {/* Target Configuration Drawer */}
      {showConfigDrawer && (
        <div className="bg-[#10131a] border border-gray-800 p-3 rounded-lg space-y-3 shrink-0 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
            <span className="text-gray-300 font-bold flex items-center gap-2">
              <Key size={13} className="text-amber-400" />
              Target & Authentication Settings
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Quick Targets:</span>
              <button
                type="button"
                onClick={() => {
                  setActiveOwner('craighckby-stack');
                  setActiveRepo('AI_Agent_OS');
                  setActiveBranch('main');
                }}
                className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-[10px]"
              >
                AI_Agent_OS
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveOwner('craighckby-stack');
                  setActiveRepo('BitNet');
                  setActiveBranch('main');
                }}
                className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-[10px]"
              >
                craighckby/BitNet
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveOwner('microsoft');
                  setActiveRepo('BitNet');
                  setActiveBranch('main');
                }}
                className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-[10px]"
              >
                microsoft/BitNet
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <label className="text-gray-400 text-[10px] block mb-1">GitHub Owner / Org</label>
              <input
                type="text"
                value={activeOwner}
                onChange={(e) => setActiveOwner(e.target.value)}
                placeholder="e.g. craighckby-stack"
                className="w-full bg-black/80 border border-gray-700 rounded px-2.5 py-1 text-gray-200 text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-400 text-[10px] block mb-1">Repository Name</label>
              <input
                type="text"
                value={activeRepo}
                onChange={(e) => setActiveRepo(e.target.value)}
                placeholder="e.g. AI_Agent_OS or BitNet"
                className="w-full bg-black/80 border border-gray-700 rounded px-2.5 py-1 text-cyan-300 text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-400 text-[10px] block mb-1">Branch / Ref</label>
              <input
                type="text"
                value={activeBranch}
                onChange={(e) => setActiveBranch(e.target.value)}
                placeholder="main / master"
                className="w-full bg-black/80 border border-gray-700 rounded px-2.5 py-1 text-rose-300 text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-400 text-[10px] block mb-1">
                GitHub Token <span className="text-gray-600">(Optional for Public)</span>
              </label>
              <input
                type="password"
                value={activeToken}
                onChange={(e) => setActiveToken(e.target.value)}
                placeholder="ghp_... or fine-grained token"
                className="w-full bg-black/80 border border-gray-700 rounded px-2.5 py-1 text-gray-200 text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-[#11141a] p-3 rounded-lg border border-gray-800/90 flex flex-col justify-between">
          <span className="text-gray-400 text-xs font-mono uppercase">Files Scanned</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-gray-100">{filesScanned}</span>
            <span className="text-[10px] text-gray-500">active items</span>
          </div>
        </div>
        <div className="bg-[#11141a] p-3 rounded-lg border border-gray-800/90 flex flex-col justify-between">
          <span className="text-gray-400 text-xs font-mono uppercase">Files Skipped</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-gray-400">{filesSkipped}</span>
            <span className="text-[10px] text-gray-600">media / minified</span>
          </div>
        </div>
        <div className="bg-[#11141a] p-3 rounded-lg border border-gray-800/90 flex flex-col justify-between">
          <span className="text-gray-400 text-xs font-mono uppercase">Total Findings</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-rose-400">{flatFindings.length}</span>
            <span className="text-[10px] text-rose-500/80 font-mono">flagged</span>
          </div>
        </div>
        <div className="bg-[#11141a] p-3 rounded-lg border border-gray-800/90 flex flex-col justify-between">
          <span className="text-gray-400 text-xs font-mono uppercase">Duration</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">{scanDuration}s</span>
            <span className="text-[10px] text-gray-500">{isScanning ? 'live' : 'elapsed'}</span>
          </div>
        </div>
      </div>

      {/* Live Status & Progress Bar & Error Diagnostic Box */}
      {(isScanning || statusMessage) && (
        <div className={`shrink-0 p-3 rounded-lg space-y-2 border ${
          isErrorState 
            ? 'bg-rose-950/20 border-rose-900/60' 
            : 'bg-[#12161f] border-rose-950/60'
        }`}>
          {isScanning && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Scanning repository tree in progress...</span>
                <span className="text-rose-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-600 to-amber-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {currentFile && (
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono truncate">
              <span className="text-rose-400 animate-pulse">●</span>
              <span className="text-gray-500">Current file:</span>
              <span className="text-gray-300 truncate">{currentFile}</span>
            </div>
          )}
          {statusMessage && (
            <div className="text-xs font-mono flex items-start gap-2">
              <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${isErrorState ? 'text-rose-400' : 'text-amber-400/90'}`} />
              <div className="space-y-1.5 flex-1">
                <span className={isErrorState ? 'text-rose-300 font-medium' : 'text-amber-300/90'}>
                  {statusMessage}
                </span>

                {/* Intelligent Recovery Suggestions for 404 & Token Errors */}
                {isErrorState && statusMessage.includes('404') && (
                  <div className="bg-black/50 border border-rose-900/40 p-2.5 rounded text-[11px] text-gray-300 space-y-2">
                    <div className="text-rose-300 font-semibold">Diagnostic Suggestions:</div>
                    <ul className="list-disc pl-4 space-y-1 text-gray-400">
                      <li>Verify the owner/org name (<span className="text-gray-200 font-mono">{activeOwner}</span>) and repo name (<span className="text-cyan-300 font-mono">{activeRepo}</span>).</li>
                      <li>If <span className="text-gray-200 font-mono">{activeRepo}</span> is a private repo, ensure your GitHub Personal Access Token is configured and has the <code className="text-amber-300 bg-amber-950/60 px-1 py-0.2 rounded font-mono">repo</code> scope enabled.</li>
                      <li>If scanning a public repository, you can scan directly or test switching targets below.</li>
                    </ul>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveOwner('craighckby-stack');
                          setActiveRepo('AI_Agent_OS');
                          handleStart(activeToken, 'craighckby-stack', 'AI_Agent_OS', 'main');
                        }}
                        className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border border-rose-700/60 flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw size={11} />
                        <span>Scan craighckby-stack/AI_Agent_OS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleStart('', activeOwner, activeRepo, activeBranch);
                        }}
                        className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 flex items-center gap-1.5 transition-colors"
                      >
                        <span>Retry Without Token (Public)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfigDrawer(true)}
                        className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-gray-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Settings size={11} />
                        <span>Edit Owner & Repo Name</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="flex flex-wrap items-center gap-3 shrink-0 bg-[#11141a] p-2.5 rounded-lg border border-gray-800/90">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input 
            type="text" 
            placeholder="Search by file path, secret type, or code snippet..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/70 border border-gray-700/80 rounded pl-8 pr-3 py-1.5 text-xs text-gray-200 focus:border-rose-500 focus:outline-none placeholder:text-gray-600 font-mono"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-black/70 border border-gray-700/80 rounded px-2.5 py-1.5 text-xs text-gray-200 focus:border-rose-500 focus:outline-none font-mono"
          >
            <option value="All">All Severities ({flatFindings.length})</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5 border-l border-gray-800 pl-2">
          <button 
            onClick={exportJSON} 
            disabled={flatFindings.length === 0} 
            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 px-2.5 py-1.5 rounded text-xs transition-colors border border-gray-700/70 font-mono"
            title="Export findings in JSON format"
          >
            <Download size={12} /> JSON
          </button>
          <button 
            onClick={exportCSV} 
            disabled={flatFindings.length === 0} 
            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 px-2.5 py-1.5 rounded text-xs transition-colors border border-gray-700/70 font-mono"
            title="Export findings in CSV spreadsheet format"
          >
            <Download size={12} /> CSV
          </button>
          <button 
            onClick={exportSARIF} 
            disabled={flatFindings.length === 0} 
            className="flex items-center gap-1 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 disabled:opacity-40 px-2.5 py-1.5 rounded text-xs transition-colors border border-rose-800/40 font-mono"
            title="Export findings in GitHub SARIF format"
          >
            <Download size={12} /> SARIF
          </button>
          <button 
            onClick={() => setShowPurgeModal(true)} 
            disabled={flatFindings.length === 0} 
            className="flex items-center gap-1 bg-rose-700 hover:bg-rose-600 text-white disabled:opacity-40 px-3 py-1.5 rounded text-xs transition-colors font-mono font-bold"
            title="Generate Git filter-repo Purge Script"
          >
            <Trash2 size={12} /> Purge Script
          </button>
        </div>
      </div>

      {/* Findings List */}
      <div className="flex-1 overflow-y-auto bg-black/60 rounded-lg border border-gray-800/90 p-3 space-y-2.5">
        {flatFindings.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs py-12 space-y-2">
            <Shield size={32} className="text-gray-700 stroke-[1.5]" />
            <p>{isScanning ? 'Actively scanning repository tree...' : 'No sensitive secrets or PII detected.'}</p>
            {!isScanning && (
              <p className="text-gray-600 text-[11px]">Click &quot;Start Repository Scan&quot; above to inspect the repository.</p>
            )}
          </div>
        ) : (
          flatFindings.map((f, i) => (
            <div 
              key={i} 
              onClick={() => handleCardClick(f)}
              className="bg-[#11141a] border border-gray-800/90 hover:border-rose-500/70 rounded-lg p-3.5 text-xs transition-all cursor-pointer group shadow-sm hover:shadow-rose-950/20"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <FileCode size={14} className="text-rose-400 shrink-0" />
                  <span className="text-rose-300 font-mono font-medium hover:underline truncate">
                    {f.file}
                  </span>
                  <span className="text-gray-500 font-mono text-[11px] bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                    Line {f.lineNum}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {getConfidenceBadge(f.confidence)}
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${getSeverityColor(f.severity)}`}>
                    {f.severity}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-gray-300 mb-2 font-medium">
                <span className="text-gray-200">{f.type}</span>
                <span className="text-[11px] text-gray-500 group-hover:text-rose-400 flex items-center gap-1 transition-colors">
                  <Eye size={12} /> View File & Redaction <ArrowRight size={11} />
                </span>
              </div>

              <div className="relative">
                <pre className="bg-[#08090c] p-2.5 rounded text-[11px] text-gray-400 overflow-x-auto whitespace-pre-wrap font-mono border border-gray-900 group-hover:border-gray-800 transition-colors">
                  {f.snippet}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>

      {/* File & Finding Detail Modal */}
      {activeFinding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1218] border border-gray-700/80 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#141822]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <FileCode size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-100 font-mono truncate max-w-lg">
                    {activeFinding.file}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-rose-400 font-medium">{activeFinding.finding.type}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-gray-400 font-mono">Line {activeFinding.finding.lineNum}</span>
                    <span className={`text-[10px] uppercase px-2 py-0.2 rounded font-bold ${getSeverityColor(activeFinding.finding.severity)}`}>
                      {activeFinding.finding.severity}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveFinding(null)} 
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Finding Summary Box */}
              <div className="bg-[#161a24] border border-gray-800 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 block mb-1">Detected Match (Target Secret):</span>
                    <div className="flex items-center justify-between bg-black/60 p-2 rounded border border-rose-900/40 font-mono text-rose-300 text-[11px] break-all">
                      <span>{activeFinding.finding.match}</span>
                      <button
                        onClick={() => copyToClipboard(activeFinding.finding.match, 'match')}
                        className="ml-2 p-1 text-gray-400 hover:text-white shrink-0"
                        title="Copy raw secret value"
                      >
                        {copiedKey === 'match' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Safe Redacted Placeholder:</span>
                    <div className="flex items-center justify-between bg-black/60 p-2 rounded border border-emerald-900/40 font-mono text-emerald-300 text-[11px] break-all">
                      <span>{`<${activeFinding.finding.type.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_REDACTED>`}</span>
                      <button
                        onClick={() => copyToClipboard(`<${activeFinding.finding.type.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_REDACTED>`, 'placeholder')}
                        className="ml-2 p-1 text-gray-400 hover:text-white shrink-0"
                        title="Copy placeholder"
                      >
                        {copiedKey === 'placeholder' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 block text-xs mb-1">Surrounding Code Snippet:</span>
                  <div className="border border-gray-800 rounded overflow-hidden">
                    <CodeMirror
                      value={activeFinding.finding.snippet}
                      extensions={[javascript()]}
                      theme="dark"
                      editable={false}
                      basicSetup={{
                        lineNumbers: false,
                        foldGutter: false,
                        highlightActiveLine: false
                      }}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Full File Inspector (if cached or available) */}
              {activeFinding.content && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-400">Complete File Content View:</span>
                    <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded border border-gray-800">
                      <button
                        onClick={() => setViewMode('original')}
                        className={`text-xs px-2.5 py-1 rounded transition-colors ${viewMode === 'original' ? 'bg-rose-900/40 text-rose-300 border border-rose-700/40' : 'text-gray-400 hover:text-gray-200'}`}
                      >
                        Original (Exposed)
                      </button>
                      <button
                        onClick={() => setViewMode('sanitized')}
                        className={`text-xs px-2.5 py-1 rounded transition-colors ${viewMode === 'sanitized' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40' : 'text-gray-400 hover:text-gray-200'}`}
                      >
                        Sanitized (Safe)
                      </button>
                    </div>
                  </div>

                  <div className="bg-black rounded-lg border border-gray-800 overflow-hidden max-h-72 overflow-y-auto">
                    <CodeMirror
                      value={viewMode === 'original' ? activeFinding.content : (activeFinding.sanitized || activeFinding.content)}
                      extensions={[javascript()]}
                      theme="dark"
                      editable={false}
                      className="text-xs font-mono"
                      basicSetup={{
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800 bg-[#141822]">
              <div className="text-xs text-gray-500 font-mono">
                Line {activeFinding.finding.lineNum} of {activeFinding.file}
              </div>
              <div className="flex items-center gap-2">
                {activeFinding.sanitized && (
                  <>
                    <button
                      onClick={() => copyToClipboard(activeFinding.sanitized || '', 'full-sanitized')}
                      className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700/50 px-3 py-1.5 rounded text-xs transition-colors font-medium"
                    >
                      {copiedKey === 'full-sanitized' ? <Check size={14} /> : <Copy size={14} />} Copy Fix
                    </button>
                    <button
                      onClick={commitSanitizedFile}
                      disabled={isCommitting}
                      className="flex items-center gap-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-800/50 px-3 py-1.5 rounded text-xs transition-colors font-medium disabled:opacity-50"
                      title="Commit this file directly to the HEAD branch"
                    >
                      <GitCommit size={14} />
                      {isCommitting ? 'Committing...' : 'Sanitize & Commit Fix'}
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    if (onFileClick) onFileClick(activeFinding.file);
                    setActiveFinding(null);
                  }}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded text-xs transition-colors font-medium"
                >
                  Open in Evolution Deck <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Purge Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0a0c10] border border-rose-900/50 rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-rose-900/30 bg-[#141822]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-500">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-sm font-bold text-rose-100">DANGER: Rewrite Git History</h3>
              </div>
              <button 
                onClick={() => setShowPurgeModal(false)} 
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 space-y-4 text-sm text-gray-300">
              <p>
                This action will generate a <code className="text-rose-400 bg-rose-950/30 px-1 rounded">purge-history.sh</code> script 
                that uses <code className="text-gray-200">git filter-repo</code> to aggressively strip all matched secrets from your entire Git history.
              </p>
              <div className="bg-rose-950/20 border border-rose-900/30 p-3 rounded text-rose-200 text-xs">
                <strong>WARNING:</strong> Running this script will rewrite your repository history. All collaborators will need to re-clone the repository. This action is irreversible.
              </div>
              
              <div className="pt-2">
                <label className="block text-xs text-gray-400 mb-1.5 font-bold uppercase tracking-wider">
                  Type <span className="text-rose-500">DELETE</span> to confirm
                </label>
                <input 
                  type="text" 
                  value={purgeConfirmText}
                  onChange={e => setPurgeConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-[#0a0c10] border border-gray-800 rounded px-3 py-2 text-white font-mono placeholder-gray-700 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="px-5 py-3 border-t border-gray-800 bg-[#141822] flex justify-end gap-2">
              <button 
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={generatePurgeScript}
                disabled={purgeConfirmText !== 'DELETE'}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 disabled:hover:bg-rose-600 px-4 py-2 rounded text-xs transition-colors font-bold"
              >
                <Trash2 size={14} /> Generate Purge Script
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

