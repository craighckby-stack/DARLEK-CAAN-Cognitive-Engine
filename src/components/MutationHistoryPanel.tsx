'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { COLORS } from '@/lib/constants';
import { Activity } from 'lucide-react';
import { safeResponseJson } from '@/lib/safe-json';

export interface MutationRecord {
  id: string;
  filePath: string;
  riskScore: number;
  status: 'applied' | 'rejected' | 'approved' | 'pending' | 'failed' | string;
  commitSha?: string;
  createdAt: string;
  provider?: string;
}

interface MutationApiResponse {
  success?: boolean;
  mutations?: MutationRecord[];
  error?: string;
}

interface MutationHistoryPanelProps {
  sessionId: string;
  refreshTrigger?: number;
}

export default function MutationHistoryPanel({ sessionId, refreshTrigger }: MutationHistoryPanelProps) {
  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  const [expanded, setExpanded] = useState<boolean>(false);
  const fetchedRef = useRef<string | null>(null);
  const lastRefreshTriggerRef = useRef<number | undefined>(refreshTrigger);

  useEffect(() => {
    if (!sessionId) return;
    
    const hasTriggerChanged = refreshTrigger !== lastRefreshTriggerRef.current;
    if (fetchedRef.current === sessionId && !hasTriggerChanged) return;
    
    fetchedRef.current = sessionId;
    lastRefreshTriggerRef.current = refreshTrigger;

    let cancelled = false;
    
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/brain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get-mutation-history', sessionId, limit: 20 }),
        });
        const data = (await safeResponseJson(res, {})) as MutationApiResponse;
        if (!cancelled && data && data.success && Array.isArray(data.mutations)) {
          setMutations(data.mutations);
        }
      } catch {
        // Suppress network/parsing errors gracefully in production monitoring panel
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [sessionId, refreshTrigger]);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const stats = useMemo(() => {
    let applied = 0;
    let rejected = 0;
    let pending = 0;

    for (let i = 0; i < mutations.length; i++) {
      const status = mutations[i].status;
      if (status === 'applied') applied++;
      else if (status === 'rejected' || status === 'failed') rejected++;
      else if (status === 'pending' || status === 'approved') pending++;
    }

    return { applied, rejected, pending };
  }, [mutations]);

  const displayedMutations = useMemo(() => {
    return expanded ? mutations : mutations.slice(0, 3);
  }, [mutations, expanded]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'applied': return COLORS.green;
      case 'rejected': case 'failed': return COLORS.dalekRed;
      case 'approved': return COLORS.cyan;
      case 'pending': return COLORS.gold;
      default: return COLORS.textMuted;
    }
  }, []);

  const getRiskColor = useCallback((risk: number) => {
    if (risk <= 3) return COLORS.cyan;
    if (risk <= 6) return COLORS.gold;
    return COLORS.dalekRed;
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, []);

  if (!sessionId || mutations.length === 0) return null;

  return (
    <div className="dalek-panel rounded-lg p-4 space-y-3">
      <div
        className="dalek-panel-header py-2 px-1 flex items-center justify-between cursor-pointer select-none"
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpanded(); }}
      >
        <div className="flex items-center gap-2">
          <Activity size={14} style={{ color: COLORS.cyan }} />
          <span style={{ fontSize: '11px' }}>MUTATION HISTORY</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '8px', color: COLORS.textMuted, fontFamily: 'var(--font-orbitron), sans-serif' }}>
            {stats.applied} applied / {stats.rejected} rejected / {stats.pending} pending
          </span>
          <span style={{ fontSize: '8px', color: COLORS.textDim }}>
            {expanded ? '\u25B2' : '\u25BC'}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        {displayedMutations.map((m) => {
          const statusCol = getStatusColor(m.status);
          const fileName = m.filePath ? m.filePath.split('/').pop() : 'unknown';
          return (
            <div
              key={m.id}
              className="px-3 py-2 rounded transition-colors"
              style={{ background: '#080808', border: `1px solid ${statusCol}15` }}
            >
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: '7px',
                    fontFamily: 'var(--font-orbitron), sans-serif',
                    fontWeight: 700,
                    color: statusCol,
                    letterSpacing: '0.05em',
                  }}
                >
                  {m.status ? m.status.toUpperCase().slice(0, 4) : 'UNK'}
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    color: COLORS.textDim,
                    fontFamily: 'var(--font-share-tech-mono), monospace',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={m.filePath}
                >
                  {fileName}
                </span>
                <span
                  style={{
                    fontSize: '8px',
                    color: getRiskColor(m.riskScore),
                    fontWeight: 600,
                  }}
                >
                  {m.riskScore}/10
                </span>
                <span style={{ fontSize: '7px', color: '#444' }}>
                  {formatDate(m.createdAt)}
                </span>
              </div>
              {m.commitSha && (
                <div style={{ fontSize: '7px', color: '#333', marginTop: '2px', paddingLeft: '2px' }}>
                  commit: {m.commitSha.slice(0, 7)}
                  {m.provider && ` via ${m.provider}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mutations.length > 3 && (
        <button
          onClick={toggleExpanded}
          style={{
            fontSize: '8px',
            color: COLORS.textMuted,
            fontFamily: 'var(--font-orbitron), sans-serif',
            letterSpacing: '0.05em',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'center',
            padding: '4px',
          }}
          type="button"
        >
          {expanded ? '\u25B2 COLLAPSE' : `\u25BC SHOW ALL (${mutations.length})`}
        </button>
      )}
    </div>
  );
}