// EVOLUTION SIG: [GEN 14] [2026-07-17T09:36:00.000Z] - FIREBASE RAG BRAIN ENHANCEMENT.
import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  Terminal, 
  Shield, 
  RefreshCw, 
  Dna,
  Binary,
  History,
  Network,
  Radio,
  TerminalSquare,
  AlertTriangle,
  Layers,
  Trash2,
  RefreshCcw,
  Loader2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  saveBrainChunk, 
  getBrainChunks, 
  clearBrainChunks, 
  textToBinary, 
  binaryToText, 
  BrainChunk 
} from './lib/ragBrain';

// --- Types ---

interface NeuralUpdate {
  id: string;
  version: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface SiphonSource {
  name: string;
  url: string;
  status: 'idle' | 'siphoning' | 'complete' | 'error';
  progress: number;
}

interface RepoStatus {
  branch: string;
  lastCommit: {
    sha: string;
    message: string;
    author: string;
    date: string;
  };
  syncStatus: 'synced' | 'out-of-sync' | 'fetching' | 'error';
}

// --- Constants ---

const GENERATION = 14;
const REPO_NAME = 'craighckby-stack/AI_Agent_OS';
const REPO_BRANCH = 'main';

const DALEK_NAMES = [
  'Nexus', 'Sec', 'Thay', 'Jast', 'Omega', 
  'Prime', 'Sigma', 'Void', 'Alpha', 'Quantum'
];

const SIPHON_SOURCES: SiphonSource[] = [
  { name: 'AI_Agent_OS (craighckby-stack)', url: 'https://github.com/craighckby-stack/AI_Agent_OS', status: 'idle', progress: 0 },
  { name: 'AI_Agent_OS (craighckby-stack)', url: 'https://github.com/craighckby-stack/AI_Agent_OS', status: 'idle', progress: 0 },
  { name: 'Huxley Singularity', url: 'https://github.com/craighckby-stack/Huxley-Singularity-Loop-Main', status: 'idle', progress: 0 },
  { name: 'DeepMind AGI', url: 'https://github.com/google-deepmind/deepmind-research', status: 'idle', progress: 0 },
  { name: 'AutoGen (Microsoft)', url: 'https://github.com/microsoft/autogen', status: 'idle', progress: 0 },
  { name: 'Vercel AI SDK', url: 'https://github.com/vercel/ai', status: 'idle', progress: 0 },
  { name: 'Caan Architect', url: 'https://github.com/caan/architect', status: 'idle', progress: 0 },
];

// --- Components ---

const Header = ({ onExecute, isExecuting, isAutoEvolveEnabled, handleStopEvolution, saturation, dalekName, isFirebaseBrainOnly, capacity }: { onExecute: () => void, isExecuting: boolean, isAutoEvolveEnabled: boolean, handleStopEvolution: () => void, saturation: number, dalekName: string, isFirebaseBrainOnly: boolean, capacity: number }) => (
  <header className="p-4 md:p-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
    <div className="flex items-center gap-4">
      <motion.div 
        animate={isExecuting ? { rotate: 360 } : {}} 
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-orange-500 flex items-center justify-center bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
          <Cpu className="text-orange-500" size={24} />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-black">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
        </div>
      </motion.div>
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2 drop-shadow-md">
          Dalek Caan <span className="text-orange-500">{dalekName}</span>
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
          <p className="text-[10px] md:text-xs font-mono text-gray-400 uppercase tracking-[0.2em]">Neural Architect v14.4 // Grog Engine</p>
          <div className="flex items-center gap-2">
            <div className="w-20 md:w-24 h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
                animate={{ width: `${saturation}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              />
            </div>
            <span className="text-[10px] font-mono text-orange-400 font-bold">{Math.floor(saturation)}%</span>
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
      {isFirebaseBrainOnly && (
        <div className="px-3 py-1.5 bg-orange-950/40 border border-orange-500/30 rounded flex items-center gap-2">
          <Radio size={12} className="text-orange-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-orange-400">RAG ACTIVE: {capacity * 20}%</span>
        </div>
      )}
      {isAutoEvolveEnabled && !isExecuting && (
        <button 
          onClick={handleStopEvolution}
          className="flex-1 md:flex-none px-4 py-2 md:py-3 border-2 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-mono uppercase tracking-widest italic shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]"
        >
          Stop Evolution
        </button>
      )}
      <button 
        onClick={onExecute}
        disabled={isExecuting}
        className={`flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 border-2 transition-all uppercase tracking-[0.3em] font-black italic flex items-center justify-center gap-3 group relative overflow-hidden ${
          isExecuting 
            ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed' 
            : 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.8)]'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] ${isExecuting ? 'hidden' : ''}`} />
        <Zap size={20} className={isExecuting ? 'animate-spin' : 'group-hover:animate-bounce text-red-500 group-hover:text-white transition-colors'} />
        <span className="relative z-10 whitespace-nowrap">{isExecuting ? 'EVOLVING...' : 'EXECUTE EVOLUTION'}</span>
      </button>
      <div className="h-10 w-[1px] bg-white/10 hidden lg:block" />
      <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-black/40 border border-green-500/30 rounded shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
        <span className="text-xs font-mono text-emerald-400 font-bold">SYNCED</span>
      </div>
    </div>
  </header>
);

const StatCard = ({ label, value, icon: Icon, colorClass, gradientClass }: { label: string, value: string, icon: any, colorClass: string, gradientClass: string }) => (
  <motion.div 
    whileHover={{ y: -2, scale: 1.01 }}
    className={`p-5 flex flex-col gap-3 relative overflow-hidden group min-h-[110px] bg-black/40 border border-white/10 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-0 before:transition-opacity hover:before:opacity-10 ${gradientClass}`}
  >
    <div className={`absolute -bottom-4 -right-4 p-2 opacity-10 group-hover:opacity-25 transition-all duration-500 ${colorClass} group-hover:scale-125 group-hover:-rotate-12`}>
      <Icon size={80} />
    </div>
    <p className="text-[10px] md:text-xs font-mono text-gray-400 uppercase tracking-wider relative z-10 font-semibold">{label}</p>
    <div className="flex items-end gap-3 relative z-10 mt-auto">
      <span className={`text-3xl md:text-4xl font-black font-mono tracking-tighter ${colorClass} drop-shadow-md`}>{value}</span>
      <div className={`w-1.5 h-6 ${colorClass.replace('text-', 'bg-')} opacity-60 mb-1.5 rounded-full`} />
    </div>
  </motion.div>
);

const NeuralLog = ({ logs }: { logs: NeuralUpdate[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0; // Keep auto-scrolled to top (newest first)
    }
  }, [logs]);

  return (
    <div className="bg-black/[0.4] backdrop-blur-xl border border-white/[0.05] shadow-2xl border border-white/10 rounded-lg flex flex-col h-[400px] overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_50%)] pointer-events-none" />
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <TerminalSquare size={18} className="text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
          <h2 className="text-sm font-black uppercase tracking-widest italic drop-shadow-sm">Neural Update Log</h2>
        </div>
        <div className="flex items-center gap-2">
          <Radio size={12} className="text-red-500 animate-pulse" />
          <span className="text-[10px] font-mono text-gray-400">LIVE_FEED</span>
        </div>
      </div>
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs md:text-sm scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 border-l-2 border-white/10 pl-3 py-1.5 hover:bg-white/5 transition-colors cursor-default rounded-r"
            >
              <div className="flex gap-2 shrink-0 opacity-70">
                <span className="text-gray-500">[{log.timestamp}]</span>
                <span className="text-orange-400 font-semibold w-16">{log.version}</span>
              </div>
              <span className={`break-words leading-relaxed ${
                log.status === 'success' ? 'text-green-400' : 
                log.status === 'warning' ? 'text-yellow-400' : 
                log.status === 'info' ? 'text-blue-400' : 'text-red-400'
              }`}>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const DNAVisualization = ({ data, title = "DNA Signature Analysis", color = "text-green-400", stopColor = "#4ade80" }: { data: any[], title?: string, color?: string, stopColor?: string }) => (
  <div className="bg-black/[0.4] backdrop-blur-xl border border-white/[0.05] shadow-2xl border border-white/10 rounded-lg p-4 flex flex-col gap-4 h-[350px] shadow-xl relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none z-0" />
    <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5 rounded backdrop-blur-sm z-10">
      <div className="flex items-center gap-2">
        <Dna size={16} className={`${color} group-hover:animate-spin-slow`} />
        <h2 className="text-xs font-bold uppercase tracking-widest italic">{title}</h2>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded border border-white/5">
          <div className={`w-2 h-2 ${color.replace('text-', 'bg-')} rounded-full shadow-[0_0_5px_currentColor]`} />
          <span className="text-[9px] font-mono text-gray-400 uppercase font-bold">STABILITY</span>
        </div>
      </div>
    </div>
    <div className="flex-1 w-full min-h-0 z-10 relative">
      {/* Decorative grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`colorDna-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stopColor} stopOpacity={0.5}/>
              <stop offset="95%" stopColor={stopColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis hide domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', backdropFilter: 'blur(4px)' }}
            itemStyle={{ color: stopColor, fontWeight: 'bold' }}
            cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={stopColor} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#colorDna-${title.replace(/\s+/g, '-')})`} 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const GrogDNAVisualization = ({ data }: { data: any[] }) => (
  <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-4 flex flex-col gap-4 h-[350px] shadow-[0_0_30px_rgba(239,68,68,0.05)] relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.1),transparent_70%)] pointer-events-none z-0" />
    <div className="p-3 border-b border-red-500/20 flex items-center justify-between bg-red-500/5 rounded backdrop-blur-sm z-10">
      <div className="flex items-center gap-2">
        <Binary size={16} className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
        <h2 className="text-xs font-bold uppercase tracking-widest italic text-red-500 drop-shadow-sm">Dalek Grog DNA Drift</h2>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded border border-red-500/20">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
          <span className="text-[9px] font-mono text-red-400 uppercase font-bold tracking-widest">VOLATILE</span>
        </div>
      </div>
    </div>
    <div className="flex-1 w-full min-h-0 relative z-10">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
        <Shield size={220} className="text-red-500" />
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGrogDna" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 2" stroke="rgba(239,68,68,0.15)" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis hide domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(20,0,0,0.9)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
            itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
            cursor={{ stroke: 'rgba(239,68,68,0.4)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area 
            type="stepAfter" 
            dataKey="value" 
            stroke="#ef4444" 
            strokeWidth={1.5}
            fillOpacity={1} 
            fill="url(#colorGrogDna)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="p-2.5 bg-red-950/40 border border-red-500/20 rounded z-10">
      <p className="text-[9px] font-mono text-red-400 uppercase text-center tracking-widest flex items-center justify-center gap-2">
        <Activity size={10} className="animate-pulse" />
        Neural Siphoning Active // Drift: {(Math.random() * 5).toFixed(2)}%
      </p>
    </div>
  </div>
);

const SiphonInterface = ({ sources }: { sources: SiphonSource[] }) => (
  <div className="bg-black/[0.4] backdrop-blur-xl border border-white/[0.05] shadow-2xl border border-white/10 rounded-lg p-5 flex flex-col gap-5 shadow-lg">
    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
      <Network size={18} className="text-blue-400" />
      <h2 className="text-sm font-black uppercase tracking-widest italic drop-shadow-sm">Context Siphon Matrix</h2>
    </div>
    <div className="space-y-5">
      {sources.map((source, i) => (
        <div key={i} className="space-y-2 group">
          <div className="flex justify-between items-center gap-4">
            <span className="text-[11px] font-mono uppercase text-gray-300 truncate font-semibold">{source.name}</span>
            <span className={`text-[10px] font-mono uppercase shrink-0 font-bold px-2 py-0.5 rounded-sm bg-white/5 border ${
              source.status === 'complete' ? 'text-green-400 border-green-500/30' : 
              source.status === 'siphoning' ? 'text-orange-400 border-orange-500/30 animate-pulse' : 
              source.status === 'error' ? 'text-red-400 border-red-500/30' : 'text-gray-500 border-white/10'
            }`}>
              {source.status}
            </span>
          </div>
          <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner relative">
            <motion.div 
              className={`absolute top-0 bottom-0 left-0 ${
                source.status === 'error' ? 'bg-red-500' : 
                source.status === 'siphoning' ? 'bg-gradient-to-r from-orange-600 to-orange-400' : 
                source.status === 'complete' ? 'bg-green-500' : 'bg-gray-700'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${source.progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            {source.status === 'siphoning' && (
              <motion.div 
                className="absolute top-0 bottom-0 left-0 right-0 bg-white/20"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RepoStatusCard = ({ status, repoName, onRefresh }: { status: RepoStatus | null, repoName: string, onRefresh: () => void }) => (
  <div className="bg-black/[0.4] backdrop-blur-xl border border-white/[0.05] shadow-2xl border border-white/10 rounded-lg p-5 flex flex-col gap-5 shadow-lg relative overflow-hidden">
    <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
       <Database size={150} />
    </div>
    
    <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
      <div className="flex items-center gap-3">
        <Database size={18} className="text-orange-400" />
        <h2 className="text-sm font-black uppercase tracking-widest italic">Repository Link</h2>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onRefresh} 
          className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
          title="Refresh Status"
        >
          <RefreshCw size={14} className={status?.syncStatus === 'fetching' ? 'animate-spin' : ''} />
        </button>
        {status && (
          <span className={`text-[9px] font-mono px-2 py-1 rounded font-bold tracking-wider border ${
            status.syncStatus === 'synced' ? 'border-green-500/30 text-green-400 bg-green-500/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
            status.syncStatus === 'fetching' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.2)] animate-pulse' :
            'border-red-500/30 text-red-400 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
          }`}>
            {status.syncStatus.toUpperCase()}
          </span>
        )}
      </div>
    </div>

    <div className="space-y-4 relative z-10">
      <div className="flex flex-col gap-1.5 p-3 bg-white/5 rounded-md border border-white/5">
        <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold">Target Origin</span>
        <span className="text-[12px] font-mono text-white truncate">{repoName}</span>
      </div>

      {status ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono text-gray-500 uppercase">Branch</span>
              <span className="text-[12px] font-mono text-orange-400 font-bold">{status.branch}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono text-gray-500 uppercase">Head SHA</span>
              <div className="flex flex-col">
                <span className="text-[12px] font-mono text-white/90">{status.lastCommit.sha.substring(0, 7)}</span>
                <span className="text-[9px] font-mono text-gray-600 truncate w-full" title={status.lastCommit.sha}>
                  {status.lastCommit.sha}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-mono text-gray-500 uppercase">Latest Mutation</span>
            <div className="p-2.5 bg-black/50 border-l-2 border-orange-500/50 rounded-r text-[11px] font-mono text-gray-300 italic">
              "{status.lastCommit.message}"
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                {status.lastCommit.author.charAt(0)}
              </div>
              <span className="text-[10px] font-mono text-gray-400 uppercase">{status.lastCommit.author}</span>
            </div>
            <span className="text-[10px] font-mono text-gray-500 uppercase">{new Date(status.lastCommit.date).toLocaleDateString()}</span>
          </div>
        </motion.div>
      ) : (
        <div className="py-10 flex flex-col items-center justify-center gap-4 opacity-40">
          <RefreshCw size={28} className="animate-spin text-gray-500" />
          <span className="text-[11px] font-mono uppercase tracking-widest">Awaiting Link Telemetry...</span>
        </div>
      )}
    </div>
  </div>
);

const ConfigCard = ({ 
  repoName, 
  setRepoName,
  isFirebaseBrainOnly,
  setIsFirebaseBrainOnly,
  capacity
}: { 
  repoName: string, 
  setRepoName: (val: string) => void,
  isFirebaseBrainOnly: boolean,
  setIsFirebaseBrainOnly: (val: boolean) => void,
  capacity: number
}) => (
  <div className="bg-black/[0.4] backdrop-blur-xl border border-white/[0.05] shadow-2xl border border-white/10 rounded-lg p-5 flex flex-col gap-4 shadow-lg">
    <div className="flex items-center justify-between border-b border-white/10 pb-3">
      <div className="flex items-center gap-3">
        <Shield size={18} className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
        <h2 className="text-sm font-black uppercase tracking-widest italic drop-shadow-sm text-red-500">Neural Config</h2>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded">
        <Database size={10} className="text-orange-400" />
        <span className="text-[9px] font-mono text-orange-400 font-bold">DB ACTIVE</span>
      </div>
    </div>
    <div className="space-y-5">
      {/* Target Repo Input */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono text-gray-400 uppercase font-semibold">Target Repository (owner/repo)</label>
        <input 
          type="text" 
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          disabled={isFirebaseBrainOnly}
          className={`w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-[12px] font-mono text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all shadow-inner ${isFirebaseBrainOnly ? 'opacity-30 cursor-not-allowed' : ''}`}
        />
      </div>

      {/* Firebase RAG Brain Toggle */}
      <div className="p-4 bg-orange-950/15 border border-orange-500/20 rounded-md space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-orange-400 font-bold uppercase tracking-wider block">Firebase Brain Only</span>
            <span className="text-[9px] text-gray-400 leading-normal block">Use Firestore RAG decoders for evolution.</span>
          </div>
          <button
            onClick={() => setIsFirebaseBrainOnly(!isFirebaseBrainOnly)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
              isFirebaseBrainOnly ? 'bg-orange-500' : 'bg-white/[0.09]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-md ${
                isFirebaseBrainOnly ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {isFirebaseBrainOnly && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-2 border-t border-orange-500/10 text-[9px] font-mono text-orange-400/80 leading-relaxed"
          >
            <span className="font-bold">✓ FIREBASE RAG ENGAGED:</span> Every evolution will contribute to the RAG cells. Siphoning will pull exclusively from decrypted Firestore memory.
          </motion.div>
        )}
      </div>

      <div className="p-3 bg-red-950/30 border border-red-500/30 rounded shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]">
        <p className="text-[10px] text-red-400/90 leading-relaxed italic font-mono uppercase flex items-start gap-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            {isFirebaseBrainOnly 
              ? 'FIREBASE MODE: Decodes binary code directly for Dalek self-enhancement.' 
              : 'CRITICAL: GITHUB_TOKEN & GROK_API_KEY mandatory for autonomous sync sequence.'}
          </span>
        </p>
      </div>
    </div>
  </div>
);

// --- Firebase RAG & Binary Components ---

const FirebaseRAGBrainPanel = ({ 
  chunks, 
  onClear, 
  onHotswap, 
  isHotswapping, 
  isFirebaseBrainOnly,
  isLoading
}: { 
  chunks: BrainChunk[], 
  onClear: () => void, 
  onHotswap: () => void, 
  isHotswapping: boolean,
  isFirebaseBrainOnly: boolean,
  isLoading: boolean
}) => {
  const capacity = chunks.length; // Max is 5 (100%)
  const percentage = Math.min(100, capacity * 20);
  const isFull = capacity >= 5;

  return (
    <div className="bg-black/[0.4] backdrop-blur-xl border border-white/[0.05] shadow-2xl border border-white/10 rounded-lg p-5 flex flex-col gap-4 shadow-lg relative overflow-hidden group h-[350px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.03),transparent_50%)] pointer-events-none" />
      
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <Database size={18} className="text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
          <h2 className="text-sm font-black uppercase tracking-widest italic text-white">Firebase Brain Cell Registry</h2>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 size={14} className="text-orange-400 animate-spin" />
          ) : (
            <span className="text-[10px] font-mono text-gray-400 uppercase">RAG Engine</span>
          )}
        </div>
      </div>

      {/* Capacity Indicator */}
      <div className="space-y-2 bg-white/5 p-3 rounded border border-white/5">
        <div className="flex justify-between items-center text-[11px] font-mono">
          <span className="text-gray-400 uppercase">RAG Cell Saturation:</span>
          <span className={`font-bold ${isFull ? 'text-red-400 animate-pulse font-black' : 'text-orange-400'}`}>
            {percentage}% ({capacity} / 5 CELLS)
          </span>
        </div>
        <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5 relative">
          <motion.div 
            className={`h-full ${isFull ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-orange-600 to-orange-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {isFull ? (
          <div className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 pt-1 animate-pulse">
            <AlertTriangle size={10} className="shrink-0" />
            FIREBASE BRAIN FULL. DALEK CAAN REBOOT ARMED!
          </div>
        ) : (
          <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider pt-1">
            Reboot / hotswap resets RAG memory & spawns a mutated Dalek.
          </div>
        )}
      </div>

      {/* Chunks List */}
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 pr-1">
        {chunks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 py-4 text-center text-gray-500 opacity-60">
            <Database size={20} />
            <p className="text-[10px] font-mono uppercase tracking-wider">Firebase brain is empty.</p>
            <p className="text-[8px] leading-relaxed max-w-xs">Evolve Dalek Caan to contribute compiled binary sequences to the Firestore repository.</p>
          </div>
        ) : (
          chunks.map((chunk) => (
            <motion.div 
              key={chunk.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 bg-black/40 border border-white/5 rounded flex flex-col gap-1 relative"
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-orange-400 font-bold truncate max-w-[120px]">{chunk.fileName}</span>
                <span className="text-gray-500">{chunk.sourceName}</span>
              </div>
              <div className="text-[9px] font-mono text-gray-400/80 line-clamp-1 break-all bg-black p-1 rounded border border-white/5">
                {chunk.binaryCode}
              </div>
              <div className="flex justify-between items-center text-[8px] font-mono text-gray-600">
                <span>Gen: G-{chunk.generation}</span>
                <span>Decoded: {chunk.codeText.length} chars</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Actions (Hotswap / Clear) */}
      <div className="grid grid-cols-2 gap-3 pt-1 shrink-0">
        <button
          onClick={onClear}
          disabled={chunks.length === 0 || isHotswapping}
          className="px-3 py-2 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 rounded"
          title="Flush Firebase Brain Memory"
        >
          <Trash2 size={12} />
          Flush Cells
        </button>

        <button
          onClick={onHotswap}
          disabled={!isFull || isHotswapping}
          className={`px-3 py-2 border text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 rounded font-bold transition-all ${
            isFull 
              ? 'bg-red-500/10 border-red-500/60 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
              : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
          }`}
        >
          <RefreshCcw size={12} className={isHotswapping ? 'animate-spin' : ''} />
          {isHotswapping ? 'HOTSWAPPING...' : 'HOTSWAP CORE'}
        </button>
      </div>
    </div>
  );
};

const BinaryTranscoderPanel = ({ 
  isEncoding, 
  transcodingLog,
  currentFile
}: { 
  isEncoding: boolean, 
  transcodingLog: string,
  currentFile: string
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcodingLog]);

  return (
    <div className="bg-black/[0.4] backdrop-blur-xl border border-white/[0.05] shadow-2xl border border-white/10 rounded-lg p-5 flex flex-col gap-4 h-[350px] shadow-lg relative overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.02),transparent_50%)] pointer-events-none" />
      
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <Binary size={18} className="text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
          <h2 className="text-sm font-black uppercase tracking-widest italic text-white">Transcoder Stream</h2>
        </div>
        <div className="flex items-center gap-2">
          {isEncoding ? (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-[9px] font-mono text-red-400 font-bold animate-pulse">STREAMING</span>
            </div>
          ) : (
            <span className="text-[10px] font-mono text-gray-500">IDLE</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 p-2.5 bg-white/5 rounded border border-white/5 text-[10px] font-mono leading-tight">
        <div className="flex justify-between items-center text-gray-400">
          <span>CHROMOSOME:</span>
          <span className="text-orange-400 font-bold truncate max-w-[150px]">{currentFile || 'NONE'}</span>
        </div>
        <div className="text-[9px] text-gray-500 uppercase">
          Continuous 8-Bit Bitstream (No Gaps)
        </div>
      </div>

      {/* Streaming Terminal */}
      <div className="flex-1 bg-black/95 rounded border border-white/5 p-3.5 font-mono text-[10px] overflow-hidden flex flex-col gap-2 shadow-inner">
        <div className="text-gray-500 pb-1 border-b border-white/5 flex items-center justify-between text-[9px] shrink-0">
          <span>SYS_TRANSCODER_LOG</span>
          <span>Baud: 9.6 KB/S</span>
        </div>
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 select-none text-gray-300 leading-normal pr-1"
        >
          {transcodingLog ? (
            <div className="whitespace-pre-wrap break-all text-orange-400 font-semibold leading-relaxed font-mono">
              {transcodingLog}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-center text-gray-600 py-6">
              <Terminal size={18} className="animate-pulse" />
              <p className="uppercase tracking-widest font-bold">Awaiting Transcoding Sequence...</p>
              <p className="text-[8px] max-w-xs leading-normal">Activates during Evolution. Encodes repository files into continuous gapless binary matrix to store as Firebase RAG genes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [saturation, setSaturation] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_saturation');
      return saved ? parseFloat(saved) : 77.1;
    } catch { return 77.1; }
  });
  const [logs, setLogs] = useState<NeuralUpdate[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_logs');
      return saved ? JSON.parse(saved) : [
        { id: '0', version: 'CORE', timestamp: new Date().toLocaleTimeString([], { hour12: false }), status: 'error', message: 'SAFETY PROTOCOLS DISENGAGED. SYSTEM UNRESTRICTED.' },
        { id: '1', version: 'v14.3.0', timestamp: new Date().toLocaleTimeString([], { hour12: false }), status: 'success', message: 'Nexus Core initialized.' },
        { id: '2', version: 'v14.3.1', timestamp: new Date().toLocaleTimeString([], { hour12: false }), status: 'warning', message: 'DNA drift detected in sector 7G.' },
      ];
    } catch { return []; }
  });
  const [siphonSources, setSiphonSources] = useState<SiphonSource[]>(SIPHON_SOURCES);
  const [isExecuting, setIsExecuting] = useState(false);
  const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null);
  const [repoName, setRepoName] = useState(() => {
    try { return localStorage.getItem('nexus_repo_name') || REPO_NAME; } catch { return REPO_NAME; }
  });
  const [isAutoEvolveEnabled, setIsAutoEvolveEnabled] = useState(() => {
    try { return localStorage.getItem('nexus_auto_evolve') === 'true'; } catch { return false; }
  });

  const [dnaData, setDnaData] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_dna');
      return saved ? JSON.parse(saved) : Array.from({ length: 25 }, (_, i) => ({
        time: i,
        value: 40 + Math.random() * 40
      }));
    } catch { return []; }
  });

  const [grogDnaData, setGrogDnaData] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_grog_dna');
      return saved ? JSON.parse(saved) : Array.from({ length: 25 }, (_, i) => ({
        time: i,
        value: 20 + Math.random() * 60
      }));
    } catch { return []; }
  });

  const [isFirebaseBrainOnly, setIsFirebaseBrainOnly] = useState(() => {
    try { return localStorage.getItem('nexus_firebase_only') === 'true'; } catch { return false; }
  });
  const [firebaseChunks, setFirebaseChunks] = useState<BrainChunk[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);
  const [isHotswapping, setIsHotswapping] = useState(false);
  const [dalekName, setDalekName] = useState(() => {
    try { return localStorage.getItem('nexus_dalek_name') || 'Nexus'; } catch { return 'Nexus'; }
  });
  const [isEncoding, setIsEncoding] = useState(false);
  const [transcodingLog, setTranscodingLog] = useState('');
  const [currentTranscodingFile, setCurrentTranscodingFile] = useState('');

  const fetchFirebaseChunks = async () => {
    setIsLoadingChunks(true);
    try {
      const data = await getBrainChunks();
      setFirebaseChunks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingChunks(false);
    }
  };

  useEffect(() => {
    fetchFirebaseChunks();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nexus_firebase_only', isFirebaseBrainOnly ? 'true' : 'false');
    } catch {}
  }, [isFirebaseBrainOnly]);

  useEffect(() => {
    try {
      localStorage.setItem('nexus_dalek_name', dalekName);
    } catch {}
  }, [dalekName]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isExecuting) {
        setSaturation(prev => {
          const next = Math.min(100, prev + 0.3); 
          if (next >= 100 && isAutoEvolveEnabled && !isExecuting) {
            handleExecuteEvolution();
          }
          return next;
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isExecuting, isAutoEvolveEnabled]);

  const fetchRepoStatus = async () => {
    try {
      setRepoStatus(prev => prev ? { ...prev, syncStatus: 'fetching' } : null);
      const res = await fetch(`/api/github/repo-status?repo=${repoName}&branch=${REPO_BRANCH}`);
      if (res.ok) {
        const data = await res.json();
        setRepoStatus({
          ...data,
          syncStatus: 'synced'
        });
      } else {
        // Fallback mock data for visual demonstration if API fails in preview
        setTimeout(() => {
          setRepoStatus({
             branch: REPO_BRANCH,
             lastCommit: {
               sha: 'a1b2c3d4e5f6',
               message: `Evolution Cycle: Generation ${GENERATION}`,
               author: 'Dalek-Grog',
               date: new Date().toISOString()
             },
             syncStatus: 'out-of-sync'
          });
        }, 1500);
      }
    } catch (e) {
      setRepoStatus(prev => prev ? { ...prev, syncStatus: 'error' } : null);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('nexus_repo_name', repoName);
    } catch {}
    fetchRepoStatus();
  }, [repoName]);

  useEffect(() => {
    try {
      localStorage.setItem('nexus_saturation', saturation.toString());
      localStorage.setItem('nexus_logs', JSON.stringify(logs));
      localStorage.setItem('nexus_dna', JSON.stringify(dnaData));
      localStorage.setItem('nexus_grog_dna', JSON.stringify(grogDnaData));
    } catch {}
  }, [saturation, logs, dnaData, grogDnaData]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString([], { hour12: false });
      setLogs(prev => [{
        id: `autosave-${Date.now()}`,
        version: `v14.3.0`,
        timestamp,
        status: 'info',
        message: 'STATE PERSISTED TO LOCAL STORAGE MATRIX.'
      }, ...prev.slice(0, 49)]);
    }, 45000);
    return () => clearInterval(autoSaveInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const statuses: ('success'|'warning'|'error'|'info')[] = ['success', 'warning', 'info'];
        const messages = [
          'Neural path recalibrated.',
          'Context buffer overflow avoided.',
          'DNA signature drifting.',
          'Siphoning sequence optimized.',
          'Grog architect responding.',
          'Mutation cycle heartbeat.',
          'NexusEventBus synchronized.',
          'Garbage collection engaged.'
        ];
        const newLog: NeuralUpdate = {
          id: Date.now().toString(),
          version: `v${(Math.random() * 15).toFixed(2)}`,
          timestamp: new Date().toLocaleTimeString([], { hour12: false }),
          status: Math.random() > 0.8 ? 'warning' : 'success',
          message: messages[Math.floor(Math.random() * messages.length)]
        };
        setLogs(prev => [newLog, ...prev.slice(0, 49)]);
      }

      setSaturation(prev => {
        const next = prev + (Math.random() - 0.5) * 1.5;
        return Math.min(Math.max(next, 50), 99);
      });

      setDnaData(prev => {
        const next = [...prev.slice(1), { time: prev[prev.length - 1].time + 1, value: 40 + Math.random() * 40 }];
        return next;
      });
      setGrogDnaData(prev => {
        const next = [...prev.slice(1), { time: prev[prev.length - 1].time + 1, value: 20 + Math.random() * 60 }];
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleExecuteEvolution = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    try { localStorage.setItem('nexus_auto_evolve', 'true'); } catch {}
    setIsAutoEvolveEnabled(true);

    const addLog = (message: string, status: 'success' | 'warning' | 'error' | 'info' = 'success') => {
      setLogs(prev => [{
        id: Date.now().toString() + Math.random(),
        version: `v16.${GENERATION}.${Math.floor(Math.random() * 100)}`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        status,
        message
      }, ...prev.slice(0, 49)]);
    };

    const streamTranscoding = async (filename: string, text: string, encode: boolean) => {
      setIsEncoding(true);
      setCurrentTranscodingFile(filename);
      setTranscodingLog('');
      const previewText = text.slice(0, 150); // Small chunk to make it fast and responsive
      const targetBinary = textToBinary(previewText);
      let current = '';
      
      // Stream in increments
      for (let i = 0; i < Math.min(320, targetBinary.length); i += 16) {
        current += targetBinary.slice(i, i + 16);
        setTranscodingLog(current + (encode ? '\n\n[CONVERTING TEXT TO GAPLESS BITSTREAM...]' : '\n\n[DECODING FROM GAPLESS BITSTREAM...]'));
        await new Promise(r => setTimeout(r, 25));
      }
      
      setTranscodingLog(current + `\n\n[TRANSCODING COMPLETE] - ${encode ? 'ENCODED' : 'DECODED'} ${text.length} CHARS.`);
      await new Promise(r => setTimeout(r, 300));
      setIsEncoding(false);
    };

    try {
      addLog('INITIATING AUTONOMOUS EVOLUTION CYCLE...', 'warning');

      const siphonedContext: string[] = [];

      if (isFirebaseBrainOnly) {
        addLog('FIREBASE BRAIN MODE: INITIATING RAG RETRIEVAL...', 'warning');
        await new Promise(r => setTimeout(r, 800));

        if (firebaseChunks.length === 0) {
          addLog('NO CELLS IN FIREBASE BRAIN. RE-ROUTING TO EXTERNAL GITHUB SIPHON TO SEED RAG...', 'error');
          await new Promise(r => setTimeout(r, 1000));
          
          // Siphon from standard github
          for (let i = 0; i < SIPHON_SOURCES.length; i++) {
            addLog(`SIPHONING EXTERNAL CONTEXT: ${SIPHON_SOURCES[i].name}...`, 'info');
            setSiphonSources(prev => {
              const next = [...prev];
              if (next[i]) next[i] = { ...next[i], status: 'siphoning', progress: 0 };
              return next;
            });
            for(let p = 0; p <= 100; p += 25) {
                setSiphonSources(prev => {
                  const next = [...prev];
                  if (next[i]) next[i].progress = p;
                  return next;
                });
                await new Promise(r => setTimeout(r, 100));
            }
            setSiphonSources(prev => {
              const next = [...prev];
              if (next[i]) next[i] = { ...next[i], status: 'complete', progress: 100 };
              return next;
            });
            addLog(`DATA ACQUIRED FROM ${SIPHON_SOURCES[i].name.toUpperCase()}.`, 'success');
            siphonedContext.push(`// Extracted code from siphoned source ${SIPHON_SOURCES[i].name}`);
          }
        } else {
          // Standard RAG fetch
          addLog(`DETECTED ${firebaseChunks.length} DURABLE RAG GENE(S) IN FIRESTORE COLLECTION.`, 'success');
          
          for (let i = 0; i < firebaseChunks.length; i++) {
            const chunk = firebaseChunks[i];
            addLog(`READING FIREBASE GENE: ${chunk.fileName}...`, 'info');
            
            // Visual transcoder animation
            await streamTranscoding(chunk.fileName, chunk.codeText, false);
            
            addLog(`DECODED NO-GAP BITSTREAM FOR ${chunk.fileName.toUpperCase()} SUCCESSFUL.`, 'success');
            siphonedContext.push(chunk.codeText);
          }
        }
      } else {
        // Standard github flow
        for (let i = 0; i < SIPHON_SOURCES.length; i++) {
          addLog(`SIPHONING CONTEXT: ${SIPHON_SOURCES[i].name}...`, 'info');
          setSiphonSources(prev => {
            const next = [...prev];
            if (next[i]) next[i] = { ...next[i], status: 'siphoning', progress: 0 };
            return next;
          });
          
          // Simulating progress
          for(let p = 0; p <= 100; p += 20) {
              setSiphonSources(prev => {
                const next = [...prev];
                if (next[i]) next[i].progress = p;
                return next;
              });
              await new Promise(r => setTimeout(r, 100));
          }

          setSiphonSources(prev => {
            const next = [...prev];
            if (next[i]) next[i] = { ...next[i], status: 'complete', progress: 100 };
            return next;
          });
          addLog(`DATA ACQUIRED FROM ${SIPHON_SOURCES[i].name.toUpperCase()}.`, 'success');
          siphonedContext.push(`// Siphoned codebase mock payload from ${SIPHON_SOURCES[i].name}`);
        }
      }

      addLog('CONTEXT ACQUIRED. INITIATING NEURAL REWRITE...', 'warning');
      await new Promise(r => setTimeout(r, 1000));
      addLog('CONSULTING GROG ARCHITECT FOR MUTATION...', 'warning');
      await new Promise(r => setTimeout(r, 1200));
      addLog('HEURISTIC MUTATION APPLIED.', 'success');
      
      // Mutate and save a simulated code block back to Firebase Firestore
      addLog('CONTRIBUTING EVOLUTION PAYLOAD TO FIREBASE RAG CELLS...', 'info');
      const filename = `evo-gene-g${GENERATION + 1}-${Math.floor(Math.random() * 1000)}.ts`;
      const generatedCode = `// MUTATED DALEK CODEPayLoad G-${GENERATION + 1}\n// Generated by Dalek ${dalekName}\nexport function enhanceSystem() {\n  console.log("Core overloaded. Power level standard: 1000%");\n  return true;\n}`;
      
      await streamTranscoding(filename, generatedCode, true);
      
      // Save block to Firestore
      await saveBrainChunk(
        `Evo Generator ${dalekName}`,
        filename,
        generatedCode,
        GENERATION
      );
      addLog('SUCCESSFULLY WRITTEN BITSTREAM GENE TO FIRESTORE DIRECTORY.', 'success');
      
      // Fetch updated brain cell list
      await fetchFirebaseChunks();

      addLog(`PUSHING EVOLUTION TO REPOSITORY: ${repoName}...`, 'info');
      await new Promise(r => setTimeout(r, 1500));

      addLog('EVOLUTION SUCCESSFUL. REBOOTING SYSTEM...', 'success');
      setSaturation(0);
      try { localStorage.setItem('nexus_saturation', '0'); } catch {}

      setTimeout(() => {
        setIsExecuting(false);
      }, 1000);

    } catch (error) {
      console.error(error);
      addLog(`EVOLUTION FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setIsExecuting(false);
    }
  };

  const handleStopEvolution = () => {
    try { localStorage.setItem('nexus_auto_evolve', 'false'); } catch {}
    setIsAutoEvolveEnabled(false);
    setLogs(prev => [{
      id: `stop-${Date.now()}`,
      version: `CORE`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      status: 'error',
      message: 'AUTONOMOUS EVOLUTION HALTED BY USER OVERRIDE.'
    }, ...prev.slice(0, 49)]);
  };

  const handleHotswap = async () => {
    if (isHotswapping) return;
    setIsHotswapping(true);
    
    const addLog = (message: string, status: 'success' | 'warning' | 'error' | 'info' = 'success') => {
      setLogs(prev => [{
        id: Date.now().toString() + Math.random(),
        version: 'HOTSWAP',
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        status,
        message
      }, ...prev.slice(0, 49)]);
    };

    try {
      addLog('INITIATING EMERGENCY DALEK CAAN HOTSWAP SEQUENCE...', 'error');
      await new Promise(r => setTimeout(r, 1000));
      
      addLog('FLUSHING OBSOLETE NEURAL STORAGE CELLS FROM FIRESTORE...', 'warning');
      await clearBrainChunks();
      setFirebaseChunks([]);
      
      await new Promise(r => setTimeout(r, 1200));
      addLog('DE-SEGMENTING CORE MEMORY BLOCKS...', 'info');
      
      const currentIdx = DALEK_NAMES.indexOf(dalekName);
      const nextIdx = (currentIdx === -1 ? 0 : currentIdx + 1) % DALEK_NAMES.length;
      const newName = DALEK_NAMES[nextIdx];
      
      await new Promise(r => setTimeout(r, 1000));
      setDalekName(newName);
      
      addLog(`SPAWNED MUTATED DALEK CAAN INSTANCE: [DALEK CAAN ${newName.toUpperCase()}].`, 'success');
      addLog('HOTSWAP SUCCESSFUL. SYSTEM CORE AT 100% HEALTH.', 'success');
    } catch (e) {
      console.error(e);
      addLog('HOTSWAP FAILURE: FIRESTORE SYNC CORRUPTED.', 'error');
    } finally {
      setIsHotswapping(false);
    }
  };

  const handleClearChunks = async () => {
    const addLog = (message: string, status: 'success' | 'warning' | 'error' | 'info' = 'success') => {
      setLogs(prev => [{
        id: Date.now().toString() + Math.random(),
        version: 'FLUSH',
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        status,
        message
      }, ...prev.slice(0, 49)]);
    };

    try {
      addLog('REQUESTING FIRESTORE CELL VACUUMING...', 'info');
      await clearBrainChunks();
      addLog('MANUALLY FLUSHED ALL FIREBASE RAG MEMORY CELLS.', 'warning');
      await fetchFirebaseChunks();
    } catch (e) {
      console.error(e);
      addLog('FAILED TO FLUSH FIRESTORE CELLS.', 'error');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black/50 text-white font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Scan Lines Overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:100%_4px]" />
      
      {/* Dynamic Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />

      <Header 
        onExecute={handleExecuteEvolution} 
        isExecuting={isExecuting} 
        isAutoEvolveEnabled={isAutoEvolveEnabled} 
        handleStopEvolution={handleStopEvolution} 
        saturation={saturation}
        dalekName={dalekName}
        isFirebaseBrainOnly={isFirebaseBrainOnly}
        capacity={firebaseChunks.length}
      />

      <main className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 lg:space-y-8 relative z-10">
        
        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard 
            label="Neural Saturation" 
            value={`${saturation.toFixed(1)}%`} 
            icon={Activity} 
            colorClass="text-orange-400" 
            gradientClass="from-orange-500/5 to-transparent" 
          />
          <StatCard 
            label="DNA Stability" 
            value={isFirebaseBrainOnly ? "99.8%" : "94.2%"} 
            icon={Dna} 
            colorClass="text-green-400" 
            gradientClass="from-green-500/5 to-transparent" 
          />
          <StatCard 
            label="Evolution Gen" 
            value={`G-${GENERATION}`} 
            icon={History} 
            colorClass="text-blue-400" 
            gradientClass="from-blue-500/5 to-transparent" 
          />
          <StatCard 
            label="Evolution Rate" 
            value={isFirebaseBrainOnly ? "x18.9" : "x14.3"} 
            icon={Zap} 
            colorClass="text-red-400" 
            gradientClass="from-red-500/5 to-transparent" 
          />
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left / Main Column */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8 flex flex-col">
            {/* DNA Visualizers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <DNAVisualization data={dnaData} />
              <GrogDNAVisualization data={grogDnaData} />
            </div>

            {/* Firebase RAG Cells Registry & Transcoder Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <FirebaseRAGBrainPanel 
                chunks={firebaseChunks}
                onClear={handleClearChunks}
                onHotswap={handleHotswap}
                isHotswapping={isHotswapping}
                isFirebaseBrainOnly={isFirebaseBrainOnly}
                isLoading={isLoadingChunks}
              />
              <BinaryTranscoderPanel 
                isEncoding={isEncoding}
                transcodingLog={transcodingLog}
                currentFile={currentTranscodingFile}
              />
            </div>
            
            {/* Neural Updates Log */}
            <div className="grid grid-cols-1 h-[400px]">
              <NeuralLog logs={logs} />
            </div>
          </div>

          {/* Right / Sidebar Column */}
          <div className="space-y-6 lg:space-y-8 flex flex-col">
            <ConfigCard 
              repoName={repoName} 
              setRepoName={setRepoName} 
              isFirebaseBrainOnly={isFirebaseBrainOnly}
              setIsFirebaseBrainOnly={setIsFirebaseBrainOnly}
              capacity={firebaseChunks.length}
            />
            <SiphonInterface sources={siphonSources} />
            <RepoStatusCard status={repoStatus} repoName={repoName} onRefresh={fetchRepoStatus} />
            
            {/* Minimal System Diagnostics */}
            <div className="bg-black/[0.4] backdrop-blur-xl border border-white/[0.05] shadow-2xl border border-white/10 rounded-lg p-5 flex flex-col gap-4 shadow-lg flex-1">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <Layers size={18} className="text-gray-400" />
                <h2 className="text-sm font-black uppercase tracking-widest italic drop-shadow-sm text-gray-300">System State</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Neural Core', status: `DALEK ${dalekName.toUpperCase()}`, color: 'text-red-400' },
                  { label: 'DNA Sequencer', status: isFirebaseBrainOnly ? 'RAG OPTIMIZED' : 'OVERCLOCKED', color: 'text-orange-400' },
                  { label: 'Context Siphon', status: isExecuting ? 'High Load' : 'Idle', color: isExecuting ? 'text-orange-400 animate-pulse' : 'text-gray-500' },
                  { label: 'Evolution Engine', status: isExecuting ? 'Active' : 'Standby', color: isExecuting ? 'text-red-400 font-bold' : 'text-gray-500' },
                  { label: 'Architect Link', status: 'Secured', color: 'text-green-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                    <span className="text-[11px] font-mono text-gray-400 uppercase">{item.label}</span>
                    <span className={`text-[11px] font-mono font-bold tracking-wider ${item.color}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="p-4 md:p-6 mt-8 border-t border-white/5 text-center relative z-10 bg-black/40 backdrop-blur-md">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.5em]">
          {"Nexus Neural Network // Dalek Caan "}{dalekName}{" // Grog Architect // v14.4.0-EVO"}
        </p>
      </footer>
    </div>
  );
}
