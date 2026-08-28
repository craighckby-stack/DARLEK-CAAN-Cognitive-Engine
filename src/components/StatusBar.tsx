'use client';

import React, { useMemo } from 'react';
import type { ConnectionStatus, RepoConfig } from '@/lib/types';
import { COLORS, HEALTH_STATUS_COLORS } from '@/lib/constants';
import { GitBranch, RotateCw, Activity, Clock } from 'lucide-react';

export interface StatusBarProps {
  connectionStatus: ConnectionStatus;
  repoConfig: RepoConfig;
  evolutionCycle: number;
  overallHealth: 'healthy' | 'warning' | 'critical';
  sessionStart: Date | string | number;
  userReposCount?: number;
}

interface ProviderConfig {
  readonly id: keyof ConnectionStatus;
  readonly label: string;
}

const PROVIDERS: readonly ProviderConfig[] = [
  { id: 'gemini', label: 'GEMINI' },
  { id: 'github', label: 'GITHUB' },
] as const;

export default function StatusBar({
  connectionStatus,
  repoConfig,
  evolutionCycle,
  overallHealth,
  sessionStart,
  userReposCount,
}: StatusBarProps): React.JSX.Element {
  const sessionTime = useMemo(() => {
    try {
      const date = sessionStart instanceof Date ? sessionStart : new Date(sessionStart);
      return isNaN(date.getTime())
        ? '--:--'
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  }, [sessionStart]);

  const targetRepoLabel = useMemo(() => {
    return repoConfig.owner && repoConfig.repo
      ? `${repoConfig.owner}/${repoConfig.repo}`
      : 'NOT CONFIGURED';
  }, [repoConfig.owner, repoConfig.repo]);

  const healthColor = HEALTH_STATUS_COLORS[overallHealth] || COLORS.textMuted;

  return (
    <div className="dalek-panel rounded-lg p-4 space-y-4">
      <div className="dalek-panel-header py-2 px-1 flex items-center gap-2">
        <Activity size={14} style={{ color: COLORS.dalekRed }} />
        <span style={{ fontSize: '11px' }}>SYSTEM STATUS</span>
      </div>

      {/* Connection indicators */}
      <div className="space-y-2">
        <span
          style={{
            fontSize: '9px',
            color: COLORS.textMuted,
            fontFamily: 'var(--font-orbitron), sans-serif',
            letterSpacing: '0.12em',
          }}
        >
          API CONNECTIONS
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PROVIDERS.map(({ id, label }) => {
            const status = connectionStatus[id];
            const statusColor =
              status === 'connected'
                ? COLORS.cyan
                : status === 'error'
                ? COLORS.dalekRed
                : status === 'testing'
                ? COLORS.gold
                : '#333';
            const statusText =
              status === 'connected'
                ? 'ONLINE'
                : status === 'error'
                ? 'OFFLINE'
                : status === 'testing'
                ? 'TESTING'
                : 'IDLE';

            const isConnected = status === 'connected';

            return (
              <div
                key={id}
                className="flex items-center gap-2 px-3 py-2 rounded-sm"
                style={{ background: '#080808', border: `1px solid ${COLORS.panelBorder}` }}
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${isConnected ? 'pulse-cyan' : ''}`}
                  style={{
                    background: statusColor,
                    boxShadow: isConnected ? `0 0 4px ${statusColor}` : 'none',
                  }}
                />
                <span
                  style={{
                    fontSize: '9px',
                    color: isConnected ? '#ccc' : COLORS.textDim,
                    fontFamily: 'var(--font-orbitron), sans-serif',
                    letterSpacing: '0.05em',
                  }}
                >
                  {label}
                </span>
                <span className="ml-auto" style={{ fontSize: '8px', color: statusColor }}>
                  {statusText}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Repo info */}
      <div className="space-y-2">
        <span
          style={{
            fontSize: '9px',
            color: COLORS.textMuted,
            fontFamily: 'var(--font-orbitron), sans-serif',
            letterSpacing: '0.12em',
          }}
        >
          TARGET
        </span>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-sm"
          style={{ background: '#080808', border: `1px solid ${COLORS.panelBorder}` }}
        >
          <GitBranch size={12} style={{ color: COLORS.gold }} />
          <span
            style={{
              fontSize: '11px',
              color: COLORS.gold,
              fontFamily: 'var(--font-share-tech-mono), monospace',
            }}
          >
            {targetRepoLabel}
          </span>
          {repoConfig.branch && (
            <span className="ml-auto" style={{ fontSize: '9px', color: COLORS.textMuted }}>
              {repoConfig.branch}
            </span>
          )}
        </div>
      </div>

      {/* Portfolio Status */}
      {typeof userReposCount === 'number' && userReposCount > 0 && (
        <div className="space-y-2 animate-fade-in">
          <span
            style={{
              fontSize: '9px',
              color: COLORS.textMuted,
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '0.12em',
            }}
          >
            PORTFOLIO & SIPHON CONTEXT
          </span>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-sm"
            style={{ background: '#080808', border: `1px solid ${COLORS.panelBorder}` }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span
              style={{
                fontSize: '10px',
                color: '#10b981',
                fontFamily: 'var(--font-share-tech-mono), monospace',
              }}
            >
              {userReposCount} GLOBAL/USER SIPHONS
            </span>
            <span
              className="ml-auto text-emerald-500/80 uppercase"
              style={{ fontSize: '7.5px', fontFamily: 'var(--font-orbitron), sans-serif' }}
            >
              active context
            </span>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className="px-3 py-2 rounded-sm"
          style={{ background: '#080808', border: `1px solid ${COLORS.panelBorder}` }}
        >
          <div className="flex items-center gap-1 mb-1">
            <RotateCw size={10} style={{ color: COLORS.purple }} />
            <span
              style={{
                fontSize: '8px',
                color: COLORS.textMuted,
                fontFamily: 'var(--font-orbitron), sans-serif',
                letterSpacing: '0.1em',
              }}
            >
              CYCLE
            </span>
          </div>
          <span
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: COLORS.purple,
              fontFamily: 'var(--font-orbitron), sans-serif',
            }}
          >
            {evolutionCycle}
          </span>
        </div>
        <div
          className="px-3 py-2 rounded-sm"
          style={{ background: '#080808', border: `1px solid ${COLORS.panelBorder}` }}
        >
          <div className="flex items-center gap-1 mb-1">
            <Activity size={10} style={{ color: healthColor }} />
            <span
              style={{
                fontSize: '8px',
                color: COLORS.textMuted,
                fontFamily: 'var(--font-orbitron), sans-serif',
                letterSpacing: '0.1em',
              }}
            >
              HEALTH
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: healthColor,
              textTransform: 'uppercase',
              fontFamily: 'var(--font-orbitron), sans-serif',
            }}
          >
            {overallHealth}
          </span>
        </div>
        <div
          className="px-3 py-2 rounded-sm col-span-2"
          style={{ background: '#080808', border: `1px solid ${COLORS.panelBorder}` }}
        >
          <div className="flex items-center gap-1 mb-1">
            <Clock size={10} style={{ color: COLORS.textMuted }} />
            <span
              style={{
                fontSize: '8px',
                color: COLORS.textMuted,
                fontFamily: 'var(--font-orbitron), sans-serif',
                letterSpacing: '0.1em',
              }}
            >
              TIMELINE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              style={{
                fontSize: '10px',
                color: COLORS.gold,
                fontFamily: 'var(--font-orbitron), sans-serif',
                fontWeight: 600,
              }}
            >
              ALPHA
            </span>
            <span style={{ fontSize: '9px', color: COLORS.textDim }}>
              Session: {sessionTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}