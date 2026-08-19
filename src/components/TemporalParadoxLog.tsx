import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Clock, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import type { EvolutionLogEntry } from '@/lib/types';

interface TemporalParadoxLogProps {
  logEntries?: EvolutionLogEntry[];
  rejectionMemory?: Array<{ id: string; timestamp: string | Date; filePath: string; reason: string }>;
}

function formatTimeString(ts: any): string {
  if (!ts) return new Date().toLocaleTimeString();
  if (ts instanceof Date) return ts.toLocaleTimeString();
  if (typeof ts === 'string') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? ts : d.toLocaleTimeString();
  }
  return String(ts);
}

export default function TemporalParadoxLog({ logEntries, rejectionMemory }: TemporalParadoxLogProps) {
  const [paradoxes, setParadoxes] = useState<{ id: string; time: string; description: string; type: string }[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateRealParadoxes = () => {
      const realList: { id: string; time: string; description: string; type: string }[] = [];

      // 1. Parse rejection memory
      let rejections = rejectionMemory || [];
      if (!rejections.length) {
        try {
          const savedRejection = localStorage.getItem('darlek_cann_rejection_memory');
          if (savedRejection) {
            rejections = JSON.parse(savedRejection);
          }
        } catch {}
      }

      for (const r of rejections) {
        realList.push({
          id: `rej-${r.id || Math.random()}`,
          time: formatTimeString(r.timestamp),
          description: `Mutation rejected for ${r.filePath}: ${r.reason}`,
          type: 'REJECTION'
        });
      }

      // 2. Parse log entries for REJECTED / ERROR / WARNING entries
      let logs = logEntries || [];
      if (!logs.length) {
        try {
          const savedLogs = localStorage.getItem('darlek_cann_log_entries');
          if (savedLogs) {
            logs = JSON.parse(savedLogs);
          }
        } catch {}
      }

      for (const entry of logs) {
        if (entry.type === 'ERROR' || entry.type === 'WARNING' || entry.description.includes('REJECTED') || entry.description.includes('AST') || entry.description.includes('Coherence Gate')) {
          realList.push({
            id: `log-${entry.id}`,
            time: formatTimeString(entry.timestamp),
            description: entry.description,
            type: entry.type
          });
        }
      }

      setParadoxes(realList.slice(0, 10));
    };

    updateRealParadoxes();
    const interval = setInterval(updateRealParadoxes, 3000);
    return () => clearInterval(interval);
  }, [logEntries, rejectionMemory]);

  return (
    <div className="border border-red-900/30 bg-red-950/10 p-4 mt-6 rounded-md">
      <div 
        className="flex items-center gap-2 mb-1 cursor-pointer select-none hover:bg-red-900/10 p-1 -m-1 rounded transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <AlertTriangle className="text-red-500 animate-pulse" size={16} />
        <h3 className="text-red-400 font-bold text-sm tracking-widest font-mono">
          TEMPORAL PARADOX & REJECTION LOG
        </h3>
        <span className="ml-auto text-xs text-red-500/60 flex items-center gap-1">
          <RefreshCw size={12} className={paradoxes.length > 0 ? "animate-spin" : ""} />
          {paradoxes.length} LOGIC CONFLICTS
          {isExpanded ? <ChevronDown size={14} className="ml-1" /> : <ChevronRight size={14} className="ml-1" />}
        </span>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              {paradoxes.length === 0 ? (
                <div className="text-xs text-red-900/50 italic py-2">
                  No temporal paradoxes or coherence violations recorded in current timeline state.
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
                  <AnimatePresence>
                    {paradoxes.map((paradox) => (
                      <motion.div
                        key={paradox.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-start gap-3 text-xs font-mono p-2 bg-red-900/20 border border-red-900/30 rounded"
                      >
                        <div className="text-red-400/50 min-w-[70px] flex items-center gap-1 shrink-0">
                          <Clock size={10} />
                          {paradox.time}
                        </div>
                        <div className="text-red-300 flex-1">
                          <span className="font-bold text-red-400 mr-2">[{paradox.type}]</span>
                          {paradox.description}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
