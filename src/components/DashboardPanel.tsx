'use client';

import { useState, useEffect } from 'react';
import StatusBar from './StatusBar';
import SaturationMetricsPanel from './SaturationMetrics';
import EvolutionLog from './EvolutionLog';
import DebateChamber from './DebateChamber';
import MutationHistoryPanel from './MutationHistoryPanel';
import type { SystemState, EvolutionLogEntry, DebateAgent, AgentVote } from '@/lib/types';
import { COLORS } from '@/lib/constants';
import { Cpu, RotateCw, GitCommit, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DashboardPanelProps {
  systemState: SystemState;
  logEntries: EvolutionLogEntry[];
  overallHealth: 'healthy' | 'warning' | 'critical';
  debateAgents: DebateAgent[];
  onToggleDebateAgent?: (agentId: string) => void;
  onSelectAllDebateAgents?: (active: boolean) => void;
  debateTopic: string;
  debateActive: boolean;
  debateVotes?: AgentVote[];
  debateConsensus?: string;
  rejectionCount?: number;
  brainSessionId?: string;
  historyRefreshTrigger?: number;
  isLoading?: boolean;
  batchMode?: boolean;
  batchProgress?: number;
  batchQueueLength?: number;
  activeFilePath?: string;
  mutationsApplied?: number;
  onBulkCommit?: () => void;
  bulkCommitStatus?: 'idle' | 'committing' | 'success' | 'error';
  userReposCount?: number;
  debateConsensusCoefficient?: number;
  debateCognitiveFriction?: number;
  debateEpistemicRuling?: string;
}

import { safeResponseJson } from '@/lib/safe-json';

export default function DashboardPanel({
  systemState,
  logEntries,
  overallHealth,
  debateAgents,
  onToggleDebateAgent,
  onSelectAllDebateAgents,
  debateTopic,
  debateActive,
  debateVotes,
  debateConsensus,
  rejectionCount,
  brainSessionId,
  historyRefreshTrigger,
  isLoading = false,
  batchMode = false,
  batchProgress = 0,
  batchQueueLength = 0,
  activeFilePath,
  mutationsApplied = 0,
  onBulkCommit,
  bulkCommitStatus = 'idle',
  userReposCount,
  debateConsensusCoefficient,
  debateCognitiveFriction,
  debateEpistemicRuling,
}: DashboardPanelProps) {
  const [stagedMutations, setStagedMutations] = useState<{ id: string; filePath: string }[]>([]);

  useEffect(() => {
    if (!brainSessionId) {
      const timer = setTimeout(() => setStagedMutations([]), 0);
      return () => clearTimeout(timer);
    }
    let cancelled = false;
    fetch('/api/brain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get-mutation-history', sessionId: brainSessionId, limit: 100 }),
    })
      .then((res) => safeResponseJson(res, {}))
      .then((data: any) => {
        if (!cancelled && data.success && data.mutations) {
          const approved = data.mutations.filter((m: any) => m.status === 'approved');
          setStagedMutations(approved || []);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [brainSessionId, historyRefreshTrigger, bulkCommitStatus]);

  const commitColor = bulkCommitStatus === 'success' ? COLORS.green : (bulkCommitStatus === 'error' ? COLORS.dalekRed : '#33ffaa');
  const isActionDisabled = isLoading || batchMode || bulkCommitStatus === 'committing' || stagedMutations.length === 0;

  return (
    <div className="flex flex-col gap-3 lg:gap-4 lg:h-full overflow-y-auto dalek-scrollbar p-2 custom-scrollbar">
      <StatusBar
        connectionStatus={systemState.connectionStatus}
        repoConfig={systemState.repoConfig}
        overallHealth={overallHealth}
        sessionStart={systemState.sessionStart}
        // Make sure we pass the correct updated cycle count
        evolutionCycle={systemState.evolutionCycle}
        userReposCount={userReposCount}
      />

      {/* Real-time Evolution Activity Monitor */}
      <div className="dalek-panel rounded-lg p-4 space-y-4">
        <div className="dalek-panel-header py-2 px-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={14} style={{ color: batchMode ? COLORS.cyan : COLORS.gold }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-orbitron), sans-serif' }}>LIVE OPERATION MONITOR</span>
          </div>
          <span
            className="px-1.5 py-0.5 rounded text-[8px] font-sans font-bold select-none pulse-cyan"
            style={{
              background: batchMode ? 'rgba(0,255,204,0.1)' : 'rgba(255,170,0,0.1)',
              color: batchMode ? COLORS.cyan : COLORS.gold,
              border: `1px solid ${batchMode ? COLORS.cyan : COLORS.gold}30`
            }}
          >
            {batchMode ? 'BATCH CYCLE ONLINE' : isLoading ? 'THINKING' : 'STANDBY'}
          </span>
        </div>

        <div style={{ background: '#080808', border: `1px solid ${COLORS.panelBorder}` }} className="p-3 rounded-sm space-y-3">
          {batchMode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-gray-400">BATCH PROGRESS</span>
                <span className="text-[#00ccff] font-bold">
                  {batchProgress + 1} / {batchQueueLength} ({batchQueueLength ? Math.round((batchProgress / batchQueueLength) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#111] overflow-hidden border border-white/[0.03]">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#00ccff] to-[#00ffcc]"
                  style={{
                    width: `${batchQueueLength ? (batchProgress / batchQueueLength) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.02]">
                <div>
                  <span className="block text-[8px] text-gray-500 font-mono">ACTIVE FILE</span>
                  <span className="block text-[10px] text-yellow-500 font-mono truncate" title={activeFilePath}>
                    {activeFilePath ? activeFilePath.split('/').pop() : 'Scanning...'}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] text-gray-400 font-mono">COMMITS INJECTED</span>
                  <span className="block text-[10px] text-green-500 font-mono font-bold">
                    {mutationsApplied} COMMITS
                  </span>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RotateCw size={12} className="text-amber-500 animate-spin" />
                <span className="text-[10px] text-amber-500 font-mono">Analyzing target file context...</span>
              </div>
              {activeFilePath && (
                <div className="text-[9px] text-gray-400 font-mono truncate">
                  File: <span className="text-gray-200">{activeFilePath}</span>
                </div>
              )}
            </div>
          ) : activeFilePath ? (
            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 font-mono">
                Targeted: <span className="text-[#00ffcc] font-semibold">{activeFilePath.split('/').pop()}</span>
              </div>
              <div className="text-[8px] text-gray-500 font-mono">
                Standby. Ready to evolve file using custom promoter directives.
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-gray-500 font-mono italic text-center py-1">
              Standby. Select a file from the repository to begin mutation scan.
            </div>
          )}
        </div>
      </div>

      {/* Mutation Staging Depot with dedicated bulk commit button */}
      <div className="dalek-panel rounded-lg p-4 space-y-3">
        <div className="dalek-panel-header py-2 px-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit size={14} style={{ color: commitColor }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-orbitron), sans-serif' }}>MUTATION STAGING DEPOT</span>
          </div>
          <span
            className="px-1.5 py-0.5 rounded text-[8px] font-sans font-bold select-none"
            style={{
              background: stagedMutations.length > 0 ? 'rgba(51,255,170,0.1)' : 'rgba(255,255,255,0.03)',
              color: stagedMutations.length > 0 ? '#33ffaa' : COLORS.textMuted,
              border: `1px solid ${stagedMutations.length > 0 ? '#33ffaa' : COLORS.textMuted}30`
            }}
          >
            {stagedMutations.length} STAGED
          </span>
        </div>

        <div style={{ background: '#080808', border: `1px solid ${COLORS.panelBorder}` }} className="p-3 rounded-sm space-y-3">
          {stagedMutations.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[9px] text-gray-400 font-mono">
                Approved and pending deployment:
              </div>
              <div className="space-y-1 pl-1">
                {stagedMutations.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-[10px] font-mono text-gray-300">
                    <CheckCircle2 size={11} className="text-[#33ffaa] flex-shrink-0" />
                    <span className="truncate" title={m.filePath}>
                      {m.filePath.split('/').pop()}
                    </span>
                  </div>
                ))}
                {stagedMutations.length > 3 && (
                  <div className="text-[8px] text-gray-500 italic font-mono pl-5">
                    + {stagedMutations.length - 3} more staged file(s)
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2 items-start text-gray-500 text-[10px] font-mono p-1">
              <AlertCircle size={13} className="text-gray-600 flex-shrink-0 mt-0.5" />
              <span>
                No staged mutations waiting for commit. Stage file enhancements via individual "APPROVE (STAGE)" actions to queue them.
              </span>
            </div>
          )}

          {onBulkCommit && (
            <button
              onClick={() => onBulkCommit()}
              disabled={isActionDisabled}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm text-[10px] transition-all duration-200 font-medium tracking-wide"
              style={{
                fontFamily: 'var(--font-orbitron), sans-serif',
                background: isActionDisabled ? 'rgba(255,255,255,0.02)' : `${commitColor}10`,
                color: isActionDisabled ? '#444' : commitColor,
                border: `1px solid ${isActionDisabled ? 'rgba(255,255,255,0.05)' : `${commitColor}35`}`,
                cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                ...(stagedMutations.length > 0 && !isActionDisabled ? {
                  boxShadow: `0 0 10px ${commitColor}15`,
                } : {}),
              }}
              onMouseEnter={(e) => {
                if (!isActionDisabled) {
                  e.currentTarget.style.background = `${commitColor}20`;
                  e.currentTarget.style.boxShadow = `0 0 12px ${commitColor}30, inset 0 0 20px ${commitColor}08`;
                  e.currentTarget.style.borderColor = `${commitColor}60`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActionDisabled) {
                  e.currentTarget.style.background = `${commitColor}10`;
                  e.currentTarget.style.boxShadow = `0 0 10px ${commitColor}15`;
                  e.currentTarget.style.borderColor = `${commitColor}35`;
                }
              }}
            >
              <GitCommit size={12} className={bulkCommitStatus === 'committing' ? 'animate-spin' : ''} />
              <span>&#9673;</span>
              <span>
                {bulkCommitStatus === 'committing'
                  ? 'COMMITTING STAGED CHANGES...'
                  : bulkCommitStatus === 'success'
                  ? 'BULK COMMIT SUCCESSFUL!'
                  : bulkCommitStatus === 'error'
                  ? 'COMMIT FAILED • RETRY'
                  : `COMMIT ${stagedMutations.length} STAGED MUTATION${stagedMutations.length > 1 ? 'S' : ''}`}
              </span>
            </button>
          )}
        </div>
      </div>

      <SaturationMetricsPanel metrics={systemState.saturation} />
      <EvolutionLog entries={logEntries} />
      <DebateChamber
        agents={debateAgents}
        onToggleAgent={onToggleDebateAgent}
        onSelectAll={onSelectAllDebateAgents}
        currentTopic={debateTopic}
        isActive={debateActive}
        votes={debateVotes}
        consensus={debateConsensus}
        consensusCoefficient={debateConsensusCoefficient}
        cognitiveFriction={debateCognitiveFriction}
        epistemicRuling={debateEpistemicRuling}
      />
      {brainSessionId && <MutationHistoryPanel sessionId={brainSessionId} refreshTrigger={historyRefreshTrigger} />}
    </div>
  );
}
