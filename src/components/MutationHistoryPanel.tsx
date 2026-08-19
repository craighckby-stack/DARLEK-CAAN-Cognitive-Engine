'use client';

import { useState, useEffect, useRef } from 'react';
import { COLORS } from '@/lib/constants';
import { Activity } from 'lucide-react';

import { safeResponseJson } from '@/lib/safe-json';

interface MutationRecord {
  id: string;
  filePath: string;
  riskScore: number;
  status: string;
  commitSha: string;
  createdAt: string;
  provider: string;
}

interface MutationHistoryPanelProps {
  sessionId: string;
  refreshTrigger?: number; // increment to force re-fetch
}

export default function MutationHistoryPanel({ sessionId, refreshTrigger }: MutationHistoryPanelProps) {
  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  const [expanded, setExpanded] = useState(false);
  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    // Re-fetch when refreshTrigger changes (new mutation applied/rejected)
    if (fetchedRef.current === sessionId && refreshTrigger === undefined) return;
    fetchedRef.current = sessionId;

    let cancelled = false;
    fetch('/api/brain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get-mutation-history', sessionId, limit: 20 }),
    })
      .then((res) => safeResponseJson(res, {}))
      .then((data: any) => {
        if (!cancelled && data.success) setMutations(data.mutations || []);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [sessionId, refreshTrigger]);

  if (!sessionId || mutations.length === 0) return null;

  const displayedMutations = expanded ? mutations : mutations.slice(0, 3);
  const applied = mutations.filter((m) => m.status === 'applied').length;
  const rejected = mutations.filter((m) => m.status === 'rejected').length;
  const pending = mutations.filter((m) => m.status === 'pending').length;

  const statusColor = (status: string) => {
    switch (status) {
      case 'applied': return COLORS.green;
      case 'rejected': return COLORS.dalekRed;
      case 'approved': return COLORS.cyan;
      case 'pending': return COLORS.gold;
      case 'failed': return COLORS.dalekRed;
      default: return COLORS.textMuted;
    }
  };

  const riskColor = (risk: number) => {
    if (risk <= 3) return COLORS.cyan;
    if (risk <= 6) return COLORS.gold;
    return COLORS.dalekRed;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="dalek-panel rounded-lg p-4 space-y-3">
      <div
        className="dalek-panel-header py-2 px-1 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Activity size={14} style={{ color: COLORS.cyan }} />
          <span style={{ fontSize: '11px' }}>MUTATION HISTORY</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '8px', color: COLORS.textMuted, fontFamily: 'var(--font-orbitron), sans-serif' }}>
            {applied} applied / {rejected} rejected / {pending} pending
          </span>
          <span style={{ fontSize: '8px', color: COLORS.textDim }}>
            {expanded ? '\u25B2' : '\u25BC'}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        {displayedMutations.map((m) => (
          <div
            key={m.id}
            className="px-3 py-2 rounded"
            style={{ background: '#080808', border: `1px solid ${statusColor(m.status)}15` }}
          >
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontSize: '7px',
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  fontWeight: 700,
                  color: statusColor(m.status),
                  letterSpacing: '0.05em',
                }}
              >
                {m.status.toUpperCase().slice(0, 4)}
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
              >
                {m.filePath.split('/').pop()}
              </span>
              <span
                style={{
                  fontSize: '8px',
                  color: riskColor(m.riskScore),
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
        ))}
      </div>

      {mutations.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
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
        >
          {expanded ? '\u25B2 COLLAPSE' : `\u25BC SHOW ALL (${mutations.length})`}
        </button>
      )}
    </div>
  );
}
