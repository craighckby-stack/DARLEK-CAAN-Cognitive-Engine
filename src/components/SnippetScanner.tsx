'use client';

import React, { useState, useMemo } from 'react';
import { sanitizeContent, Finding, SENSITIVE_PATTERNS } from '@/lib/scanner';
import { Shield, Sparkles, Copy, Check, Download, AlertTriangle, FileCode, RefreshCw, Trash2 } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

const SAMPLE_SNIPPETS: { label: string; code: string }[] = [
  {
    label: 'API Keys & Secrets (.env)',
    code: `# Production Environment Configuration
OPENAI_API_KEY="sk-proj-984729482039482039482039482039482039482039482039"
ANTHROPIC_API_KEY="sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvAA"
GEMINI_API_KEY="AIzaSyA8948239048230948230948203948203"
STRIPE_SECRET_KEY="sk_live_51Hz83948293482390482039482039482039482039482039"
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
DATABASE_URL="postgres://admin:SuperSecretPass123!@db.prod.internal:5432/main_db"
MONGODB_URI="mongodb+srv://root:ClusterPass99@cluster0.mongodb.net/production?retryWrites=true"
JWT_SECRET_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
`
  },
  {
    label: 'PII & Customer Data',
    code: `// Customer Records - Confidential
const customer = {
  id: "CUST-9921",
  name: "Sarah Connor",
  email: "s.connor@cyberdyne-systems.com",
  phone: "+1-415-555-0199",
  billing: {
    cardNumber: "4532015112830366", // Valid Luhn Visa
    iban: "DE89370400440532013000",
    clientIp: "192.168.1.105",
    macAddress: "00:1A:2B:3C:4D:5E"
  }
};
`
  },
  {
    label: 'High Entropy & Proprietary Token',
    code: `// Auth Service Integration
const serviceCredential = "aX89_zKpL992qQ_9x00a12bC8891234xY";
const internalToken = "k992834jklasdf902348kljsadf902348kljsadf092348";
`
  }
];

export default function SnippetScanner() {
  const [inputCode, setInputCode] = useState(SAMPLE_SNIPPETS[0].code);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sanitized' | 'findings' | 'side-by-side'>('side-by-side');

  const { sanitized, findings } = useMemo(() => {
    return sanitizeContent(inputCode);
  }, [inputCode]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadSanitized = () => {
    const blob = new Blob([sanitized], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanitized-snippet-${Date.now()}.txt`;
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
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-700/50 text-rose-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              Snippet Secret & PII Sanitizer
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                Live Memory Scan
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Instant detection for 40+ API keys, database URIs, PII, Luhn-checked cards, and high-entropy secrets.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-neutral-500">Presets:</span>
          {SAMPLE_SNIPPETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setInputCode(preset.code)}
              className="text-xs px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setInputCode('')}
            className="text-xs px-2.5 py-1 rounded bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 text-red-300 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">Total Findings</div>
          <div className="text-xl font-bold text-rose-400">{findings.length}</div>
        </div>
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">Critical / High</div>
          <div className="text-xl font-bold text-amber-400">
            {findings.filter((f) => f.severity === 'Critical' || f.severity === 'High').length}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">Input Lines</div>
          <div className="text-xl font-bold text-neutral-200">{inputCode.split('\n').length}</div>
        </div>
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">Supported Patterns</div>
          <div className="text-xl font-bold text-emerald-400">{SENSITIVE_PATTERNS.length}+</div>
        </div>
      </div>

      {/* Editor & Results Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[450px]">
        {/* Left Column: Raw Input Code */}
        <div className="flex flex-col rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-neutral-400" />
              Raw Input (Paste code or text here)
            </span>
            <span className="text-[11px] text-neutral-500">{inputCode.length} chars</span>
          </div>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Paste code snippet, .env file, JSON, or configuration with secrets..."
            className="flex-1 w-full p-3 bg-neutral-950 text-neutral-200 font-mono text-xs outline-none resize-none min-h-[350px]"
            spellCheck={false}
          />
        </div>

        {/* Right Column: Sanitized Output & CodeMirror */}
        <div className="flex flex-col rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Sanitized Output (Syntax-Highlighted)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(sanitized, 'sanitized')}
                className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1 border border-neutral-700 transition-colors"
              >
                {copiedKey === 'sanitized' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'sanitized' ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={downloadSanitized}
                className="text-xs px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 flex items-center gap-1 border border-emerald-700/50 transition-colors"
              >
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto max-h-[450px]">
            <CodeMirror
              value={sanitized || '// Paste code on the left to see sanitized output here'}
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

      {/* Findings Table List */}
      <div className="mt-4 rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800">
          <span className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Detected Secrets & PII ({findings.length})
          </span>
          {findings.length > 0 && (
            <button
              onClick={() => copyToClipboard(JSON.stringify(findings, null, 2), 'findings-json')}
              className="text-xs px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition-colors"
            >
              {copiedKey === 'findings-json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              Export Findings JSON
            </button>
          )}
        </div>

        {findings.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No secrets or sensitive PII patterns detected in the current snippet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-900 max-h-[300px] overflow-y-auto">
            {findings.map((finding, idx) => (
              <div key={idx} className="p-3 hover:bg-neutral-900/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono text-[11px]">
                    L{finding.lineNum}
                  </span>
                  {getSeverityBadge(finding.severity)}
                  {getConfidenceBadge(finding.confidence)}
                  <span className="font-semibold text-neutral-200">{finding.type}</span>
                </div>
                <div className="flex-1 max-w-xl text-neutral-400 truncate font-mono bg-black/40 px-2 py-1 rounded border border-neutral-900">
                  <span className="text-neutral-500">Context: </span>
                  <span className="text-neutral-300">{finding.snippet}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(finding.match, `match-${idx}`)}
                  className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                >
                  {copiedKey === `match-${idx}` ? 'Copied' : 'Copy Value'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
