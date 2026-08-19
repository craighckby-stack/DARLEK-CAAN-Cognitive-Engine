'use client';

import { useState } from 'react';
import type { PendingMutation } from '@/lib/types';
import { COLORS } from '@/lib/constants';
import { FileCode, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, GitBranch, FolderSync } from 'lucide-react';

interface MutationDiffViewProps {
  mutation: PendingMutation;
  onApprove: (mode: 'stage' | 'commit') => void;
  onReject: () => void;
  disabled: boolean;
  onPathChange?: (newPath: string) => void;
  onBranchChange?: (newBranch: string) => void;
  debateVotes?: any[];
}

export default function MutationDiffView({ 
  mutation, 
  onApprove, 
  onReject, 
  disabled,
  onPathChange,
  onBranchChange,
  debateVotes 
}: MutationDiffViewProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [showProposed, setShowProposed] = useState(false);

  const riskLabel = mutation.riskScore <= 3 ? 'LOW' : mutation.riskScore <= 6 ? 'MEDIUM' : mutation.riskScore <= 8 ? 'HIGH' : 'CRITICAL';
  const riskColor = mutation.riskScore <= 3 ? COLORS.cyan : mutation.riskScore <= 6 ? COLORS.gold : COLORS.dalekRed;

  const truncate = (code: string, maxLines: number = 20) => {
    const lines = code.split('\n');
    if (lines.length <= maxLines) return code;
    return lines.slice(0, maxLines).join('\n') + `\n\n... (${lines.length - maxLines} more lines)`;
  };

  const originalSize = (mutation.originalContent.length / 1024).toFixed(1);
  const proposedSize = (mutation.proposedCode.length / 1024).toFixed(1);
  const sizeDiff = ((mutation.proposedCode.length - mutation.originalContent.length) / mutation.originalContent.length * 100).toFixed(0);
  const sizeDiffSign = mutation.proposedCode.length > mutation.originalContent.length ? '+' : '';

  return (
    <div
      className="space-y-3 p-4 mx-3 mb-3 rounded-lg"
      style={{
        background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.05) 0%, rgba(212, 160, 23, 0.03) 100%)',
        border: `1px solid ${riskColor}25`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} style={{ color: riskColor }} />
          <span
            style={{
              fontFamily: 'var(--font-orbitron), sans-serif',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: riskColor,
            }}
          >
            MUTATION PROPOSAL [{riskLabel}]
          </span>
        </div>
        <span
          style={{
            fontSize: '8px',
            color: COLORS.textMuted,
            fontFamily: 'var(--font-share-tech-mono), monospace',
          }}
        >
          Risk: {mutation.riskScore}/10
        </span>
      </div>

      {/* File info */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: '#080808' }}>
        <FileCode size={11} style={{ color: COLORS.gold }} />
        <span style={{ fontSize: '10px', color: COLORS.gold, fontFamily: 'var(--font-share-tech-mono), monospace' }}>
          {mutation.filePath}
        </span>
        <span className="ml-auto" style={{ fontSize: '9px', color: COLORS.textMuted }}>
          {originalSize}KB → {proposedSize}KB ({sizeDiffSign}{sizeDiff}%)
        </span>
      </div>

      {/* Operator Refinement Dashboard */}
      <div className="p-3 rounded-sm space-y-3" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-1.5 pb-1 border-b border-white/5">
          <FolderSync size={11} style={{ color: COLORS.purple }} />
          <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'var(--font-orbitron), sans-serif', color: COLORS.purple }}>
            OPERATOR PATH & BRANCH REFINEMENT
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block">Target File Path</label>
            <input
              type="text"
              value={mutation.filePath}
              onChange={(e) => onPathChange?.(e.target.value)}
              className="w-full text-[10px] px-2 py-1 rounded bg-[#050505] text-gray-200 border border-white/10 focus:border-purple/50 focus:outline-none font-mono"
              placeholder="e.g. src/utils/engine.ts"
              id="refine-file-path-input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block">Target Branch</label>
            <input
              type="text"
              value={mutation.targetBranch || ''}
              onChange={(e) => onBranchChange?.(e.target.value || '')}
              className="w-full text-[10px] px-2 py-1 rounded bg-[#050505] text-gray-200 border border-white/10 focus:border-purple/50 focus:outline-none font-mono"
              placeholder="e.g. main"
              id="refine-branch-input"
            />
          </div>
        </div>

        {/* Display alternate options proposed during agent debate */}
        {debateVotes && debateVotes.some(v => v.structuralProposal && v.structuralProposal.newPath) && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[8px] text-[#ffaa00] font-bold uppercase tracking-wider block">Debate Agent Proposed Structures:</span>
            <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-1 select-none">
              {debateVotes.map((v, idx) => {
                const prop = v.structuralProposal;
                if (!prop || !prop.newPath) return null;
                const matchesCurrent = prop.newPath === mutation.filePath && prop.branch === (mutation.targetBranch || '');
                return (
                  <button
                    key={`${v.agentId}-${idx}`}
                    onClick={() => {
                      if (onPathChange) onPathChange(prop.newPath);
                      if (onBranchChange) onBranchChange(prop.branch || '');
                    }}
                    className="w-full text-left p-1.5 rounded flex items-center justify-between text-[9px] font-mono transition-all border shrink-0 cursor-pointer"
                    style={{
                      background: matchesCurrent ? 'rgba(255, 170, 0, 0.08)' : '#050505',
                      borderColor: matchesCurrent ? 'rgba(255, 170, 0, 0.4)' : 'rgba(255,255,255,0.05)',
                      color: matchesCurrent ? '#ffaa00' : '#888',
                    }}
                    id={`debate-proposal-pill-${v.agentId}-${idx}`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-[8px] text-gray-400">{v.agentName} ({prop.type?.toUpperCase()}):</span>
                      <span className="text-gray-200 mt-0.5 truncate max-w-[280px] block" title={prop.newPath}>
                        {prop.newPath}
                      </span>
                    </div>
                    {prop.branch && (
                      <span className="px-1 py-0.5 rounded bg-purple/10 text-purple border border-purple/20 text-[7px] max-w-[120px] truncate block ml-2" title={prop.branch}>
                        <GitBranch size={8} className="inline mr-0.5" />
                        {prop.branch}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Analysis */}
      <div className="px-3 py-2 rounded-sm" style={{ background: '#060606' }}>
        <span
          style={{
            display: 'block',
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            fontFamily: 'var(--font-orbitron), sans-serif',
            color: COLORS.textMuted,
            marginBottom: '6px',
          }}
        >
          ANALYSIS
        </span>
        <p style={{ fontSize: '11px', color: COLORS.textDim, lineHeight: 1.5, fontFamily: 'var(--font-share-tech-mono), monospace' }}>
          {mutation.analysis}
        </p>
      </div>

      {/* Affected files */}
      {mutation.affectedFiles.length > 0 && (
        <div className="px-3 py-2 rounded-sm" style={{ background: '#060606' }}>
          <span
            style={{
              display: 'block',
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-orbitron), sans-serif',
              color: COLORS.gold,
              marginBottom: '4px',
            }}
          >
            AFFECTED FILES ({mutation.affectedFiles.length})
          </span>
          {mutation.affectedFiles.map((f) => (
            <div key={f} style={{ fontSize: '10px', color: COLORS.textDim, fontFamily: 'var(--font-share-tech-mono), monospace' }}>
              • {f}
            </div>
          ))}
        </div>
      )}

      {/* Original code toggle */}
      <div>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-sm"
          style={{
            background: '#080808',
            border: '1px solid rgba(255, 32, 32, 0.08)',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '9px', color: COLORS.dalekRed, fontFamily: 'var(--font-orbitron), sans-serif', letterSpacing: '0.08em' }}>
            ORIGINAL CODE
          </span>
          {showOriginal ? <ChevronUp size={12} style={{ color: COLORS.textMuted }} /> : <ChevronDown size={12} style={{ color: COLORS.textMuted }} />}
        </button>
        {showOriginal && (
          <pre
            className="px-3 py-2 mt-1 rounded-sm overflow-x-auto dalek-scrollbar"
            style={{
              fontSize: '10px',
              color: COLORS.textDim,
              background: '#050505',
              fontFamily: 'var(--font-share-tech-mono), monospace',
              lineHeight: 1.4,
              maxHeight: '300px',
              overflow: 'auto',
              border: '1px solid rgba(255, 32, 32, 0.06)',
            }}
          >
            {truncate(mutation.originalContent, 50)}
          </pre>
        )}
      </div>

      {/* Proposed code toggle */}
      <div>
        <button
          onClick={() => setShowProposed(!showProposed)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-sm"
          style={{
            background: '#080808',
            border: '1px solid rgba(0, 255, 204, 0.08)',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '9px', color: COLORS.cyan, fontFamily: 'var(--font-orbitron), sans-serif', letterSpacing: '0.08em' }}>
            PROPOSED CODE
          </span>
          {showProposed ? <ChevronUp size={12} style={{ color: COLORS.textMuted }} /> : <ChevronDown size={12} style={{ color: COLORS.textMuted }} />}
        </button>
        {showProposed && (
          <pre
            className="px-3 py-2 mt-1 rounded-sm overflow-x-auto dalek-scrollbar"
            style={{
              fontSize: '10px',
              color: '#e0e0e0',
              background: '#050505',
              fontFamily: 'var(--font-share-tech-mono), monospace',
              lineHeight: 1.4,
              maxHeight: '300px',
              overflow: 'auto',
              border: '1px solid rgba(0, 255, 204, 0.06)',
            }}
          >
            {truncate(mutation.proposedCode, 50)}
          </pre>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onReject}
          disabled={disabled}
          className="dalek-btn dalek-btn-red px-3 py-2 text-xs flex items-center justify-center gap-1.5"
          style={{ minWidth: '85px' }}
        >
          <XCircle size={13} />
          REJECT
        </button>
        <button
          onClick={() => onApprove('stage')}
          disabled={disabled}
          className="flex-1 px-3 py-2 text-xs flex items-center justify-center gap-1.5 rounded font-medium border text-cyan bg-cyan/10 hover:bg-cyan/20 border-cyan/30 hover:border-cyan/50 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          style={{ fontFamily: 'var(--font-orbitron), sans-serif', letterSpacing: '0.04em' }}
        >
          <CheckCircle size={13} />
          APPROVE (STAGE)
        </button>
        <button
          onClick={() => onApprove('commit')}
          disabled={disabled}
          className="dalek-btn dalek-btn-green flex-1 px-3 py-2 text-xs flex items-center justify-center gap-1.5"
          style={{ fontFamily: 'var(--font-orbitron), sans-serif', letterSpacing: '0.04em' }}
        >
          <CheckCircle size={13} />
          APPROVE (COMMIT)
        </button>
      </div>
    </div>
  );
}
