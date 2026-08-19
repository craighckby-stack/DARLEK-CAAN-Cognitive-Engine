'use client';

import type { DebateAgent, AgentVote } from '@/lib/types';
import { COLORS } from '@/lib/constants';
import { Users } from 'lucide-react';

interface DebateChamberProps {
  agents: DebateAgent[];
  onToggleAgent?: (agentId: string) => void;
  onSelectAll?: (active: boolean) => void;
  currentTopic: string;
  isActive: boolean;
  votes?: AgentVote[];
  consensus?: string;
  consensusCoefficient?: number;
  cognitiveFriction?: number;
  epistemicRuling?: string;
}

export default function DebateChamber({ 
  agents, 
  onToggleAgent, 
  onSelectAll, 
  currentTopic, 
  isActive, 
  votes, 
  consensus,
  consensusCoefficient,
  cognitiveFriction,
  epistemicRuling 
}: DebateChamberProps) {
  // Merge agent definitions with vote results
  const agentsWithVotes = agents.map(agent => {
    const vote = votes?.find(v => v.agentId === agent.id);
    return { ...agent, vote };
  });

  return (
    <div className="dalek-panel rounded-lg p-4 space-y-3">
      <div className="dalek-panel-header py-2 px-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={14} style={{ color: COLORS.purple }} />
          <span style={{ fontSize: '11px' }}>DEBATE CHAMBER</span>
          {onSelectAll && !isActive && (
            <button
              onClick={() => onSelectAll(agents.some(a => a.status === 'idle') ? true : false)}
              className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors uppercase tracking-wider border border-white/10"
            >
              {agents.every(a => a.status === 'active') ? 'DESELECT ALL' : 'SELECT ALL'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {consensus && (
            <span
              style={{
                fontSize: '8px',
                fontFamily: 'var(--font-orbitron), sans-serif',
                letterSpacing: '0.08em',
                color: consensus === 'APPROVE' ? COLORS.green : consensus === 'REJECT' ? COLORS.dalekRed : COLORS.gold,
                fontWeight: 700,
              }}
            >
              {consensus}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isActive ? COLORS.purple : '#333',
                boxShadow: isActive ? `0 0 4px ${COLORS.purple}` : 'none',
              }}
            />
            <span style={{ fontSize: '9px', color: isActive ? COLORS.purple : COLORS.textMuted, fontFamily: 'var(--font-orbitron), sans-serif', letterSpacing: '0.08em' }}>
              {isActive ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* Agent grid with votes */}
      <div className="grid grid-cols-1 gap-2">
        {agentsWithVotes.map((agent) => {
          const voteColor = agent.vote?.vote === 'approve' ? COLORS.green : agent.vote?.vote === 'reject' ? COLORS.dalekRed : COLORS.gold;
          const voteIcon = agent.vote?.vote === 'approve' ? '\u2713' : agent.vote?.vote === 'reject' ? '\u2717' : '\u25CB';
          const voteLabel = agent.vote?.vote === 'approve' ? 'APPROVE' : agent.vote?.vote === 'reject' ? 'REJECT' : 'ABSTAIN';

          return (
            <div
              key={agent.id}
              onClick={() => {
                if (!isActive && onToggleAgent) {
                  onToggleAgent(agent.id);
                }
              }}
              className="px-3 py-2 rounded"
              style={{
                background: '#080808',
                border: `1px solid ${agent.vote ? `${voteColor}20` : COLORS.panelBorder}`,
                cursor: !isActive && onToggleAgent ? 'pointer' : 'default',
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-xs flex-shrink-0"
                  style={{ color: agent.status === 'active' ? agent.color : '#333' }}
                >
                  {agent.status === 'active' ? '\u25CF' : '\u25CB'}
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-orbitron), sans-serif',
                    letterSpacing: '0.05em',
                    color: agent.status === 'active' ? '#ccc' : '#444',
                    fontWeight: agent.status === 'active' ? 600 : 400,
                  }}
                >
                  {agent.name}
                </span>
                {agent.vote && (
                  <>
                    <span
                      className="ml-auto"
                      style={{
                        fontSize: '8px',
                        color: voteColor,
                        fontFamily: 'var(--font-orbitron), sans-serif',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {voteIcon} {voteLabel}
                    </span>
                    <span
                      style={{
                        fontSize: '8px',
                        color: COLORS.textMuted,
                        fontFamily: 'var(--font-orbitron), sans-serif',
                      }}
                    >
                      {agent.vote.confidence}%
                    </span>
                  </>
                )}
                {agent.vote && (
                  <span
                    style={{
                      fontSize: '7px',
                      color: '#444',
                      fontFamily: 'var(--font-share-tech-mono), monospace',
                    }}
                  >
                    via {agent.vote.provider}
                  </span>
                )}
              </div>
              {agent.vote?.reasoning && (
                <p
                  style={{
                    fontSize: '9px',
                    color: COLORS.textDim,
                    fontFamily: 'var(--font-share-tech-mono), monospace',
                    marginTop: '4px',
                    paddingLeft: '18px',
                    lineHeight: 1.4,
                  }}
                >
                  &quot;{agent.vote.reasoning}&quot;
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Dialectical Alignment Indices (Epistemic Debate Engine Upgrade) */}
      {(consensusCoefficient !== undefined || cognitiveFriction !== undefined || epistemicRuling) && (
        <div 
          className="p-3 rounded-lg border border-purple-950/30 bg-[#070007]/60 space-y-2.5"
          id="epistemic-debate-metrics"
        >
          <div className="flex items-center gap-1.5 border-b border-purple-950/20 pb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span style={{ fontSize: '9px', color: COLORS.purple, fontFamily: 'var(--font-orbitron), sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}>
              ✦ DIALECTICAL EQUILIBRIUM MECHANICS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {consensusCoefficient !== undefined && (
              <div className="space-y-1">
                <span className="text-[8px] text-gray-500 font-mono block">CONSENSUS RATIO</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#120512] h-1.5 rounded border border-purple-900/20 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-fuchsia-500 h-full transition-all duration-1000"
                      style={{ width: `${consensusCoefficient * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-purple-400 font-bold">
                    {Math.round(consensusCoefficient * 100)}%
                  </span>
                </div>
              </div>
            )}

            {cognitiveFriction !== undefined && (
              <div className="space-y-1">
                <span className="text-[8px] text-gray-400 font-mono block">COGNITIVE FRICTION</span>
                <span className={`text-[9px] font-mono font-bold block ${cognitiveFriction > 0.5 ? 'text-amber-500' : 'text-[#00ffcc]'}`}>
                  {cognitiveFriction > 0.5 ? 'HIGH • DISPUTED PREMISES' : 'LOW • SWARM CONVERGENCE'}
                </span>
              </div>
            )}
          </div>

          {epistemicRuling && (
            <div className="pt-2 border-t border-purple-950/20 space-y-1">
              <span className="text-[8px] text-gray-500 font-mono block">EPISTEMOLOGICAL RULING (SYNTHESIS):</span>
              <p className="text-[9px] text-[#dacada] font-mono leading-relaxed bg-[#0d000d]/80 p-2 rounded border border-purple-950/40 italic">
                &ldquo;{epistemicRuling}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {/* Current debate topic */}
      {currentTopic && (
        <div
          className="debate-topic px-3 py-2 rounded text-center"
          style={{
            background: 'rgba(204, 0, 255, 0.03)',
            border: '1px solid rgba(204, 0, 255, 0.08)',
          }}
        >
          <span style={{ fontSize: '8px', color: COLORS.textMuted, fontFamily: 'var(--font-orbitron), sans-serif', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>
            CURRENT TOPIC
          </span>
          <p style={{ fontSize: '10px', color: COLORS.purple, fontFamily: 'var(--font-share-tech-mono), monospace', lineHeight: 1.4 }}>
            {currentTopic}
          </p>
        </div>
      )}

      {!currentTopic && (
        <div
          className="px-3 py-2 rounded text-center"
          style={{ background: '#060606' }}
        >
          <p style={{ fontSize: '10px', color: COLORS.textMuted }}>
            No active debate. Initiate analysis to convene the chamber.
          </p>
        </div>
      )}
    </div>
  );
}
