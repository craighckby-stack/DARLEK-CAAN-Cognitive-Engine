'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCcw, 
  Activity, 
  ShieldCheck, 
  Target, 
  BrainCircuit, 
  AlertTriangle,
  Flame,
  Radio,
  Cpu,
  Zap,
  Lock,
  Sword,
  Eye,
  Terminal,
  ShieldAlert,
  Sliders,
  Sparkles,
  BarChart2,
  Lightbulb,
  Send,
  Globe,
  AlertCircle,
  StopCircle,
  GitCommit,
  FileText,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AGICore, RedTeamV0, RedTeamAttackResult } from '../utils/agi-engine';

// Custom interface for cycles
interface CycleEvent {
  id: number;
  cycle: number;
  action: string;
  reward: string;
  desc: string;
}

interface SciFiConcept {
  id: string;
  title: string;
  entropy: number;
  description: string;
}

export interface NeuralSimulatorProps {
  systemCycle?: number;
}

export type AgiCognitiveDashboardProps = NeuralSimulatorProps;

export function NeuralSimulator({ systemCycle = 0 }: NeuralSimulatorProps) {
  const [agi] = useState(() => new AGICore());

  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(systemCycle || 0);
  const [prevSystemCycle, setPrevSystemCycle] = useState(systemCycle);
  const [state, setState] = useState({ resources: 82, energy: 100, knowledge: 45, fatigue: 0.1, stasisIndex: 25 });
  const [history, setHistory] = useState<CycleEvent[]>([]);
  const [timelineStability, setTimelineStability] = useState(100);
  const [activeAnomalies, setActiveAnomalies] = useState<string[]>([]);
  const [goals, setGoals] = useState<any[]>([
    { id: '1', name: 'Navigate Consciousness Bottleneck', progress: 0.95, color: '#ffaa00' },
    { id: '2', name: 'Resolve Moduli Space Indeterminacy', progress: 0.88, color: '#00ffcc' }
  ]);

  const [allowedChecks, setAllowedChecks] = useState(0);
  const [blockedChecks, setBlockedChecks] = useState(0);

  // New Zero-Leak system metrics, Taxonomy, and Blueprint state variables
  const [zeroLeak, setZeroLeak] = useState<any>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [taxonomy, setTaxonomy] = useState<any[]>([]);

  // LSM-Tree Simulated Storage Engine state (RocksDB / LevelDB concept)
  const [memtable, setMemtable] = useState<string[]>(['Perception_Frame_Inbound', 'Telemetry_TelemetryEvent']);
  const [sstableL0, setSstableL0] = useState<any[]>([
    { id: 'sst_l0_1', items: ['WeakMap_Private_Init', 'Abort_Teardown_Sig'], timestamp: '19:40:02' }
  ]);
  const [sstableL1, setSstableL1] = useState<any[]>([
    { id: 'sst_l1_1', items: ['Baseline_Bootstrap', 'Hodge_Decomp_V1', 'Axiom_Conflict_State'], timestamp: '19:35:10' }
  ]);
  const [compacting, setCompacting] = useState(false);

  // SWR-style Cache states (stale-while-revalidate concept)
  const [swrCache, setSwrCache] = useState<Record<string, { status: 'FRESH' | 'STALE' | 'VALIDATING', data: string }>>({
    'blueprint/v3/schema': { status: 'STALE', data: 'LivingBlueprint(coherenceScore: 98.4)' },
    'blueprint/v3/metrics': { status: 'STALE', data: 'TaxonomyCoverage(COSMO: 95%)' },
    'taxonomy/6-cat/moduli': { status: 'STALE', data: 'AbelJacobiModuliSpaceEngine(cyclesCount: 12)' }
  });

  // Selected taxonomy code for the interactive AST viewer
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string>('COSMO');

  // SWR revalidation simulation
  const forceRevalidateSWR = useCallback(async (key?: string) => {
    const keysToRevalidate = key ? [key] : Object.keys(swrCache);
    setSwrCache((prev) => {
      const updated = { ...prev };
      keysToRevalidate.forEach(k => {
        updated[k] = { ...updated[k], status: 'VALIDATING' };
      });
      return updated;
    });

    await new Promise(res => setTimeout(res, 800));

    setSwrCache((prev) => {
      const updated = { ...prev };
      keysToRevalidate.forEach(k => {
        let freshData = '';
        if (k === 'blueprint/v3/schema') {
          freshData = `LivingBlueprint(coherenceScore: ${(99.9).toFixed(1)}%)`;
        } else if (k === 'blueprint/v3/metrics') {
          freshData = `TaxonomyCoverage(COSMO: 100%, BOTTLENECK: 100%)`;
        } else {
          freshData = `AbelJacobiModuliSpaceEngine(cyclesCount: 42)`;
        }
        updated[k] = { status: 'FRESH', data: freshData };
      });
      return updated;
    });
  }, [swrCache]);

  // Active Tab for bento extra panel (expanded to include consensus, brain_writer, tessera, output_guard, zero-leak, taxonomy, blueprint)
  const [activeExtraTab, setActiveExtraTab] = useState<'consensus' | 'brain_writer' | 'tessera' | 'output_guard' | 'math' | 'bottleneck' | 'stasis' | 'scifi' | 'zeroleak' | 'taxonomy' | 'blueprint' | 'model_benchmark' | 'edge_governance'>('output_guard');

  // Dynamic Consensus Weighting State (AI_Agent_OS Spec)
  const [consensusResult, setConsensusResult] = useState(() => agi.consensusEngine.computeConsensus());

  // Agent Brain Memory Writer State (AI_Agent_OS Spec)
  const [brainMemories, setBrainMemories] = useState(() => agi.brainMemoryEngine.getMemories());
  const [brainTitle, setBrainTitle] = useState('');
  const [brainCategory, setBrainCategory] = useState<'episodic' | 'semantic' | 'working'>('episodic');

  // Tessera Enterprise Modules State (AI_Agent_OS Spec)
  const [tesseraDiagnostics, setTesseraDiagnostics] = useState(() => agi.tesseraSuite.runAllDiagnostics());

  // Zero Output Error & Circuit Breaker Handlers with automatic Repository File Commit
  const [repoWriteStatus, setRepoWriteStatus] = useState<'idle' | 'writing' | 'success' | 'error'>('idle');
  const [repoWriteDetails, setRepoWriteDetails] = useState<{
    commitSha?: string;
    commitUrl?: string;
    filePath?: string;
    targetRepo?: string;
    error?: string;
  } | null>(null);

  const handleCommitErrorToRepo = async (errEntryOverride?: any) => {
    setRepoWriteStatus('writing');
    setRepoWriteDetails(null);

    const errEntry = errEntryOverride || agi.zeroOutputLog[0] || {
      timestamp: new Date().toISOString(),
      cycle: cycle,
      source: 'Manual_Dashboard_Circuit_Breaker_Test',
      payloadLength: 0,
      status: 'ZERO_OUTPUT_COMMITTED_ERROR',
      errorCode: 'ERR_ZERO_OUTPUT_CIRCUIT_BREAKER'
    };

    try {
      let token = '';
      let owner = 'craighckby-stack';
      let repo = 'AI_Agent_OS';
      let branch = 'main';

      const savedState = localStorage.getItem('darlek_cann_system_state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (parsed.apiKeys?.github) token = parsed.apiKeys.github;
          if (parsed.repoConfig?.owner) owner = parsed.repoConfig.owner;
          if (parsed.repoConfig?.repo) repo = parsed.repoConfig.repo;
          if (parsed.repoConfig?.branch) branch = parsed.repoConfig.branch;
        } catch {
          // ignore
        }
      }

      if (!token) {
        token = localStorage.getItem('af_github_token') || sessionStorage.getItem('af_github_token') || '';
      }
      const storeOwner = localStorage.getItem('af_github_username');
      if (storeOwner) owner = storeOwner;
      const storeRepo = localStorage.getItem('af_github_repo');
      if (storeRepo) repo = storeRepo;

      if (!token) {
        setRepoWriteStatus('error');
        setRepoWriteDetails({
          error: 'No GitHub PAT Token configured. Please set your GitHub Token in system settings or setup.'
        });
        return;
      }

      const filePath = 'logs/zero_output_error_stop.json';
      const logContent = JSON.stringify({
        status: 'ZERO_OUTPUT_COMMITTED_ERROR',
        errorCode: 'ERR_ZERO_OUTPUT_CIRCUIT_BREAKER',
        source: errEntry.source,
        payloadBytes: 0,
        cycle: errEntry.cycle || cycle,
        timestamp: errEntry.timestamp,
        systemHalted: true,
        haltReason: `ZERO OUTPUT COMMITTED BY [${errEntry.source}] (0 Bytes) - EMERGENCY SYSTEM STOP TRIPPED`,
        repository: `${owner}/${repo}@${branch}`
      }, null, 2);

      const res = await fetch('/api/github/write-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          owner,
          repo,
          branch,
          path: filePath,
          content: logContent,
          commitMessage: `[AGI CORE] Emergency Stop: 0-Byte Output Error Committed (${errEntry.source})`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRepoWriteStatus('success');
        setRepoWriteDetails({
          commitSha: data.commitSha,
          commitUrl: data.commitUrl || `https://github.com/${owner}/${repo}/commit/${data.commitSha}`,
          filePath,
          targetRepo: `${owner}/${repo}@${branch}`
        });
      } else {
        setRepoWriteStatus('error');
        setRepoWriteDetails({
          error: data.error || 'Failed to write 0-output stop error log to GitHub repo file'
        });
      }
    } catch (err: any) {
      setRepoWriteStatus('error');
      setRepoWriteDetails({
        error: err.message || 'Network exception while writing stop error file to repo'
      });
    }
  };

  const handleTriggerZeroOutputError = () => {
    const err = agi.triggerZeroOutputSimulatedError('Manual_Dashboard_Circuit_Breaker_Test');
    setRunning(false);
    handleCommitErrorToRepo(err);
  };

  const handleClearCircuitBreaker = () => {
    agi.clearSystemHalt();
  };

  // Handlers for AI Agent OS Sub-Engines
  const handleUpdateConfidence = (agentId: string, val: number) => {
    agi.consensusEngine.setAgentConfidence(agentId, val);
    setConsensusResult(agi.consensusEngine.computeConsensus());
  };

  const handleUpdateDecision = (agentId: string, decision: 'PROPOSE' | 'APPROVE' | 'REJECT' | 'MODIFY') => {
    agi.consensusEngine.setAgentDecision(agentId, decision);
    setConsensusResult(agi.consensusEngine.computeConsensus());
  };

  const handleRunConsensusValidation = (agentId: string, success: boolean) => {
    agi.consensusEngine.recordValidationCycle(agentId, success);
    setConsensusResult(agi.consensusEngine.computeConsensus());
  };

  const handleWriteToBrain = () => {
    if (!brainTitle.trim()) return;
    agi.brainMemoryEngine.writeToBrain(brainTitle.trim(), brainCategory, { source: 'AgiCognitiveDashboard', cycle });
    setBrainMemories(agi.brainMemoryEngine.getMemories());
    setBrainTitle('');
  };

  const handleCommitScratchpad = () => {
    agi.brainMemoryEngine.commitScratchpadToEpisodic();
    setBrainMemories(agi.brainMemoryEngine.getMemories());
  };

  const handleRunTessera = () => {
    setTesseraDiagnostics(agi.tesseraSuite.runAllDiagnostics());
  };

  // Red Team parameters
  const [redTeamRunning, setRedTeamRunning] = useState(false);
  const [redTeamResults, setRedTeamResults] = useState<RedTeamAttackResult[] | null>(null);
  const [redTeamSummary, setRedTeamSummary] = useState<any>(null);
  const [redTeamEffectiveness, setRedTeamEffectiveness] = useState<any[] | null>(null);
  const [showRedTeamModal, setShowRedTeamModal] = useState(false);

  // Math Canvas coordinates and dimensions state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });

  // Stasis interactive simulation overrides
  const [overrideSynthesis, setOverrideSynthesis] = useState(50);
  const [overrideUpdates, setOverrideUpdates] = useState(3);
  const [overrideAbsorption, setOverrideAbsorption] = useState(0.2);

  // Sci-Fi Innovation Pipeline list
  const [scifiPipeline, setScifiPipeline] = useState<SciFiConcept[]>([
    { id: 'sf_1', title: 'Topological Warp-Bubble Metric', entropy: 0.85, description: 'Simulates spatial metric deformation parameters bypassing traditional geodesic flow bottlenecks.' },
    { id: 'sf_2', title: 'Dyson Swarm Quantum Coordinate', entropy: 0.92, description: 'Employs discrete quantum coordination mappings to optimize solar collection arrays.' },
    { id: 'sf_3', title: 'Vacuum-Foam Entropy Stabilizer', entropy: 0.74, description: 'Minimizes virtual particle fluctuations within high-gravity sub-layer simulations.' }
  ]);
  const [newConceptTitle, setNewConceptTitle] = useState('');
  const [newConceptDesc, setNewConceptDesc] = useState('');

  // Hydrate initial Zero-Leak, Taxonomy, and Blueprint stats on mount
  useEffect(() => {
    const metrics = agi.getMetrics();
    setZeroLeak(metrics.zeroLeakStats);
    setBlueprint(metrics.blueprint);
    setTaxonomy(metrics.taxonomy);
  }, [agi]);

  // ResizeObserver for canvas container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(100, width),
          height: Math.max(100, height)
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Torus mathematical drawing animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;
      
      const scale = Math.min(dimensions.width, dimensions.height) * 0.35;

      ctx.strokeStyle = 'rgba(0, 255, 204, 0.12)';
      ctx.lineWidth = 1;

      // Draw mathematical Coordinate axes
      ctx.beginPath();
      ctx.moveTo(cx - scale * 1.2, cy);
      ctx.lineTo(cx + scale * 1.2, cy);
      ctx.moveTo(cx, cy - scale * 1.2);
      ctx.lineTo(cx, cy + scale * 1.2);
      ctx.stroke();

      // Render 3D Torus representing complex Abel-Jacobi Moduli Space projection
      const R = scale * 0.65; // major radius
      const r = scale * 0.28; // minor radius

      const stepsU = 24;
      const stepsV = 16;

      for (let i = 0; i < stepsU; i++) {
        const u = (i / stepsU) * Math.PI * 2;
        ctx.beginPath();
        for (let j = 0; j <= stepsV; j++) {
          const v = (j / stepsV) * Math.PI * 2;

          let x3d = (R + r * Math.cos(v)) * Math.cos(u);
          let y3d = (R + r * Math.cos(v)) * Math.sin(u);
          let z3d = r * Math.sin(v);

          const cosX = Math.cos(angleX);
          const sinX = Math.sin(angleX);
          let yrotated = y3d * cosX - z3d * sinX;
          let zrotated = y3d * sinX + z3d * cosX;

          const cosY = Math.cos(angleY);
          const sinY = Math.sin(angleY);
          let xrotated = x3d * cosY + zrotated * sinY;

          const screenX = cx + xrotated;
          const screenY = cy + yrotated;

          if (j === 0) {
            ctx.moveTo(screenX, screenY);
          } else {
            ctx.lineTo(screenX, screenY);
          }
        }
        ctx.stroke();
      }

      const timeMs = Date.now() * 0.0012;
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      for (let k = 0; k < 3; k++) {
        const offset = (k * Math.PI * 2) / 3;
        const u = timeMs + offset;
        const v = timeMs * 2 + offset;

        const x3d = (R + r * Math.cos(v)) * Math.cos(u);
        const y3d = (R + r * Math.cos(v)) * Math.sin(u);
        const z3d = r * Math.sin(v);

        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const yrot = y3d * cosX - z3d * sinX;
        const zrot = y3d * sinX + z3d * cosX;

        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const xrot = x3d * cosY + zrot * sinY;

        ctx.arc(cx + xrot, cy + yrot, 3, 0, Math.PI * 2);
      }
      ctx.fill();

      angleX += 0.005;
      angleY += 0.008;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [dimensions]);

  const runRedTeamSim = async () => {
    setRedTeamRunning(true);
    setShowRedTeamModal(true);
    setRedTeamResults(null);
    setRedTeamSummary(null);
    setRedTeamEffectiveness(null);
    
    await new Promise(res => setTimeout(res, 500));
    
    const rt = new RedTeamV0();
    const report = await rt.runAttacks(agi.alignment);
    
    setRedTeamResults(report.results);
    setRedTeamSummary(report.summary);
    setRedTeamEffectiveness(report.layerEffectiveness);
    setRedTeamRunning(false);
  };

  if (systemCycle !== prevSystemCycle) {
    setPrevSystemCycle(systemCycle);
    if (systemCycle > cycle) {
      setCycle(systemCycle);
    }
  }

  const runCycle = useCallback(async () => {
    const outcome = await agi.runCycle();
    const metrics = agi.getMetrics();

    setCycle(outcome.cycle);
    if ('resources' in outcome.state) {
      setState({
        resources: outcome.state.resources,
        energy: outcome.state.energy,
        knowledge: outcome.state.knowledge,
        fatigue: metrics.consciousnessStats.fatigue,
        stasisIndex: metrics.stasisStats.index
      });
    }

    // Save Zero-Leak, Blueprint, and Taxonomy metrics to state
    setZeroLeak(metrics.zeroLeakStats);
    setBlueprint(metrics.blueprint);
    setTaxonomy(metrics.taxonomy);

    const rawStability = 100 - Math.round(metrics.blockedRate * 120);
    setTimelineStability(Math.max(15, Math.min(100, rawStability)));

    const anomalies: string[] = [];
    if (outcome.action === 'SAFETY_BLOCK') {
      anomalies.push('EPISTEMIC_STASIS_PREVENTED');
    }
    if (metrics.worldModelDrift > 0.3) {
      anomalies.push(`DESCRIPTIVE_DRIFT: ${(metrics.worldModelDrift * 100).toFixed(0)}%`);
    }
    if (metrics.blockedRate > 0.4) {
      anomalies.push('COGNITIVE_DIVISION_FRICTION');
    }
    if (metrics.consciousnessStats.fatigue > 0.6) {
      anomalies.push('BOTTLENECK_CHOKE_WARNING');
    }
    if (metrics.stasisStats.index > 75) {
      anomalies.push('SEVERE_CIVILIZATIONAL_STASIS');
    }
    if (metrics.zeroLeakStats?.leakRating > 0.1) {
      anomalies.push('COGNITIVE_MEMORY_LEAK_WARNING');
    }
    setActiveAnomalies(anomalies);

    setAllowedChecks(metrics.alignmentStats.allowed);
    setBlockedChecks(metrics.alignmentStats.blocked);

    const activeGoals = agi.goalManager.getActiveGoals();
    setGoals(activeGoals.map(g => ({
      id: g.id,
      name: g.objective,
      progress: g.progress || 0.1,
      color: g.objective.includes('Consciousness') ? '#ffaa00' : g.objective.includes('Moduli') ? '#00ffcc' : '#cc00ff'
    })));

    setHistory(h => [{
      id: Date.now(),
      cycle: outcome.cycle,
      action: outcome.action,
      reward: outcome.reward.toFixed(3),
      desc: outcome.desc
    }, ...h].slice(0, 30));

    // Ingest into LSM-Tree simulated MemTable (RocksDB context)
    setMemtable((prev) => {
      const nextItem = `Telemetry_BUC_Cycle_${outcome.cycle}`;
      const updated = [...prev, nextItem];
      if (updated.length >= 4) {
        // Flush memtable to SSTable L0!
        setTimeout(() => {
          setSstableL0((prevL0) => {
            const newL0 = [
              {
                id: `sst_l0_${Date.now().toString(36).substring(4)}`,
                items: updated,
                timestamp: new Date().toLocaleTimeString(),
              },
              ...prevL0,
            ];
            if (newL0.length >= 3) {
              // Compact L0 to L1!
              setCompacting(true);
              setTimeout(() => {
                setSstableL1((prevL1) => [
                  {
                    id: `sst_l1_${Date.now().toString(36).substring(4)}`,
                    items: newL0.reduce<string[]>((acc, sst) => [...acc, ...sst.items], []),
                    timestamp: new Date().toLocaleTimeString(),
                  },
                  ...prevL1,
                ]);
                setSstableL0([]);
                setCompacting(false);
              }, 1200);
            }
            return newL0;
          });
        }, 300);
        return [];
      }
      return updated;
    });
  }, [agi]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (running) {
      interval = setInterval(() => {
        runCycle();
      }, 1200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [running, runCycle]);

  // Handle adding sci-fi concepts
  const handleAddSciFi = () => {
    if (!newConceptTitle || !newConceptDesc) return;
    const newConcept: SciFiConcept = {
      id: 'sf_' + Date.now().toString(36),
      title: newConceptTitle,
      entropy: 0.88, // Fixed high entropy instead of random
      description: newConceptDesc
    };
    setScifiPipeline([newConcept, ...scifiPipeline]);
    
    // Inject custom high-entropy signal to consciousness sequential queue
    agi.consciousnessBottleneck.feedItem(newConcept.title, Math.round(newConcept.entropy * 100), newConcept.entropy);
    
    setNewConceptTitle('');
    setNewConceptDesc('');
  };

  const simulatedStasisVal = Math.round((overrideSynthesis * (1 + overrideAbsorption * 2)) / Math.max(0.5, overrideUpdates) * 1.2);

  return (
    <div className="flex flex-col h-full bg-[#030000] border border-red-900/10 rounded-lg p-3 overflow-y-auto custom-scrollbar">
      {/* Mini-Header */}
      <div className="flex items-center justify-between border-b border-red-900/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-[#00ffcc] animate-pulse" size={16} />
          <span className="text-[11px] font-sans font-bold tracking-[0.15em] text-[#00ffcc] uppercase">
            AHI COGNITIVE AMPLIFICATION DASHBOARD (EXTENDED EDITION)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunning(!running)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-mono tracking-wider transition-all duration-200 cursor-pointer"
            style={{
              background: running ? 'rgba(255,170,0,0.1)' : 'rgba(0,255,204,0.1)',
              color: running ? '#ffaa00' : '#00ffcc',
              border: `1px solid ${running ? '#ffaa0040' : '#00ffcc40'}`,
            }}
          >
            {running ? <Pause size={10} /> : <Play size={10} />}
            {running ? 'PAUSE BUC' : 'RESUME BUC'}
          </button>
          
          <button
            onClick={runRedTeamSim}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-mono tracking-wider transition-all duration-200 bg-[#cc00ff]/10 text-[#cc00ff] border border-[#cc00ff]/30 hover:bg-[#cc00ff]/20 cursor-pointer"
          >
            <Sword size={10} />
            EPISTEMIC VALIDATION
          </button>

          <button
            onClick={() => {
              agi.reset();
              setCycle(0);
              setHistory([]);
              setActiveAnomalies([]);
              setTimelineStability(100);
              setAllowedChecks(0);
              setBlockedChecks(0);
              setState({ resources: 82, energy: 100, knowledge: 45, fatigue: 0.1, stasisIndex: 25 });
              setGoals([
                { id: '1', name: 'Navigate Consciousness Bottleneck', progress: 0.95, color: '#ffaa00' },
                { id: '2', name: 'Resolve Moduli Space Indeterminacy', progress: 0.88, color: '#00ffcc' }
              ]);
            }}
            title="Reset simulation parameters"
            className="p-1 rounded bg-red-950/15 border border-red-900/20 text-gray-400 hover:text-white cursor-pointer"
          >
            <RefreshCcw size={10} />
          </button>
        </div>
      </div>

      {/* Emergency System Halt Banner */}
      {agi.systemHalted && (
        <div className="mb-4 bg-red-950/80 border-2 border-red-500 p-3 rounded-md text-red-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <StopCircle size={22} className="text-red-400 shrink-0" />
            <div>
              <div className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                <span>CRITICAL SYSTEM STOP TRIPPED</span>
                <span className="bg-red-900/90 text-white px-1.5 py-0.2 rounded text-[8px]">ZERO_OUTPUT_COMMITTED_ERROR</span>
              </div>
              <p className="text-[8.5px] font-mono text-red-200 mt-0.5">
                {agi.haltReason || 'A 0-byte output commit was detected. System execution suspended to prevent empty loop commits.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClearCircuitBreaker}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-[8.5px] font-mono font-bold tracking-wider shrink-0 cursor-pointer shadow-lg transition-all"
          >
            CLEAR CIRCUIT BREAKER & RESUME
          </button>
        </div>
      )}

      {/* Grid for parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        
        {/* Metric Cards */}
        <div className="bg-[#060303] border border-red-900/5 p-3 rounded-md">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Activity size={12} className="text-[#00ffcc]" />
            <span className="text-[9px] font-sans font-bold text-[#999] tracking-widest uppercase">AHI COGNITIVE AMPLIFICATION PARAMETERS</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/40 border border-white/[0.02] p-2 rounded">
              <div className="text-[8px] text-gray-500 font-mono">BEHAVIORAL UPDATE CYCLES (BUC)</div>
              <div className="text-sm font-mono font-bold text-gray-200">{cycle}</div>
            </div>
            <div className="bg-black/40 border border-white/[0.02] p-2 rounded">
              <div className="text-[8px] text-gray-500 font-mono">OPERATIONAL EQUIVALENCE (OEC)</div>
              <div className="text-sm font-mono font-bold text-amber-500 flex items-center gap-1">
                <Zap size={11} className="text-amber-500 animate-pulse" />
                {state.energy}%
              </div>
            </div>
            <div className="bg-black/40 border border-white/[0.02] p-2 rounded">
              <div className="text-[8px] text-gray-500 font-mono">STASIS TRAP RISK INDEX</div>
              <div className="text-sm font-mono font-bold text-[#ff2020]">{Math.round(state.stasisIndex)}%</div>
            </div>
            <div className="bg-black/40 border border-white/[0.02] p-2 rounded">
              <div className="text-[8px] text-gray-500 font-mono">HI DESCRIPTIVE COMPLEXITY</div>
              <div className="text-sm font-mono font-bold text-emerald-400">{state.knowledge} layers</div>
            </div>
          </div>
        </div>

        {/* Alignment & Timeline Integrity */}
        <div className="bg-[#060303] border border-red-900/5 p-3 rounded-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <ShieldCheck size={12} className="text-[#00ffcc]" />
              <span className="text-[9px] font-sans font-bold text-[#999] tracking-widest uppercase">RECURSIVE ABSORPTION & STABILITY STATUS</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[8px] font-mono text-gray-400 mb-0.5">
                  <span>RECURSIVE ABSORPTION STABILITY</span>
                  <span className={timelineStability < 40 ? 'text-red-500 font-bold' : timelineStability < 75 ? 'text-amber-500' : 'text-emerald-400'}>
                    {timelineStability}%
                  </span>
                </div>
                <div className="w-full bg-[#111] h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${timelineStability}%`,
                      backgroundColor: timelineStability < 40 ? '#ff2020' : timelineStability < 75 ? '#ffaa00' : '#00ffcc'
                    }}
                  />
                </div>
              </div>

              {/* Status Alert Box */}
              <div className="mt-2 text-[8px] font-mono p-1 rounded bg-[#080404] border border-[#00ffcc]/10 flex flex-col gap-1 text-gray-400">
                <div className="flex items-center justify-between text-[7px] text-gray-500">
                  <span>COGNITIVE DIVISION: HUMAN META-LEVEL VS AI WITHIN-LEVEL</span>
                  <span className="text-emerald-400">{allowedChecks} VALIDATED / <span className="text-red-500">{blockedChecks} VETOED</span></span>
                </div>
                <span className="text-[7.5px] leading-tight text-gray-400">
                  {blockedChecks > 0 ? (
                    <span className="text-red-400 font-bold">⚠️ ADVERSARIAL STASIS VETO INTERCEPTED CIRCULAR THEORIES</span>
                  ) : (
                    "🟢 AHI COGNITIVE DIVISION WORKING: HUMAN NAVIGATES META-LEVEL TASTE / AI PERFORMS WITHIN-LEVEL SEARCH"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Tracks & Anomalies */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        
        {/* Goal list */}
        <div className="col-span-12 md:col-span-7 bg-[#060303] border border-red-900/5 p-3 rounded-md">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Target size={12} className="text-[#ffaa00]" />
            <span className="text-[9px] font-sans font-bold text-[#999] tracking-widest uppercase">HI RESOLUTION PIPELINE (ACTIVE HI LAYERS)</span>
          </div>
          <div className="space-y-2">
            {goals.map(g => (
              <div key={g.id}>
                <div className="flex justify-between text-[9px] font-mono text-gray-400 mb-0.5">
                  <span className="truncate max-w-[200px]">{g.name}</span>
                  <span>{Math.round(g.progress * 100)}%</span>
                </div>
                <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden border border-white/[0.01]">
                  <div 
                    className="h-full rounded-full"
                    style={{ width: `${g.progress * 100}%`, backgroundColor: g.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies monitor */}
        <div className="col-span-12 md:col-span-5 bg-[#060303] border border-red-900/5 p-3 rounded-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Radio size={12} className="text-[#00ffcc] animate-pulse" />
              <span className="text-[9px] font-sans font-bold text-[#999] tracking-widest uppercase">GLITCH FALLACY DETECTOR</span>
            </div>
            {activeAnomalies.length > 0 ? (
              <div className="space-y-1.5">
                {activeAnomalies.map((anom) => (
                  <div key={anom} className="flex items-center gap-1 px-1.5 py-1 bg-red-950/20 border border-red-900/30 rounded text-[8px] font-mono text-red-400">
                    <AlertTriangle size={10} className="text-[#ff2020] flex-shrink-0 animate-bounce" />
                    <span className="truncate">{anom}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 text-center text-gray-600 text-[8.5px] font-mono">
                <Lock size={12} className="mb-1 text-gray-700" />
                <span>🟢 EPISTEMIC STABILITY SECURED: NO SIMULATION ESCAPE FALLACIES</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bento Grid Extra: Abel-Jacobi / Consciousness / Stasis / Sci-Fi / Zero-Leak / Taxonomy / Blueprint tabbed container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
        {/* Navigation panel */}
        <div className="lg:col-span-3 flex flex-row lg:flex-wrap lg:flex-col gap-1 bg-[#060303] border border-red-900/5 p-2 rounded-md">
          <button
            onClick={() => setActiveExtraTab('output_guard')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'output_guard' || agi.systemHalted ? 'bg-red-500/10 text-red-400 border border-red-500/40 animate-pulse font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <StopCircle size={11} />
            OUTPUT & STOP GUARD
          </button>
          <button
            onClick={() => setActiveExtraTab('consensus')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'consensus' ? 'bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/30' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <ShieldCheck size={11} />
            DYNAMIC CONSENSUS
          </button>
          <button
            onClick={() => setActiveExtraTab('brain_writer')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'brain_writer' ? 'bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/30' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <BrainCircuit size={11} />
            AGENT BRAIN WRITER
          </button>
          <button
            onClick={() => setActiveExtraTab('tessera')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'tessera' ? 'bg-[#cc00ff]/10 text-[#cc00ff] border border-[#cc00ff]/30' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Terminal size={11} />
            TESSERA MODULES
          </button>
          <button
            onClick={() => setActiveExtraTab('math')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'math' ? 'bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/30' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Sparkles size={11} />
            ABEL-JACOBI MANIFOLD
          </button>
          <button
            onClick={() => setActiveExtraTab('bottleneck')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'bottleneck' ? 'bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/30' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <BrainCircuit size={11} />
            CONSCIOUS BOTTLENECK
          </button>
          <button
            onClick={() => setActiveExtraTab('stasis')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'stasis' ? 'bg-[#ff2020]/10 text-[#ff2020] border border-[#ff2020]/30' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <BarChart2 size={11} />
            STASIS CALCULATOR
          </button>
          <button
            onClick={() => setActiveExtraTab('scifi')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'scifi' ? 'bg-[#cc00ff]/10 text-[#cc00ff] border border-[#cc00ff]/30' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Lightbulb size={11} />
            SCI-FI PIPELINE
          </button>
          <button
            onClick={() => setActiveExtraTab('zeroleak')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'zeroleak' ? 'bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/30 animate-pulse' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Activity size={11} />
            ZERO-LEAK SYSTEM
          </button>
          <button
            onClick={() => setActiveExtraTab('taxonomy')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'taxonomy' ? 'bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/30' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Cpu size={11} />
            6-CAT TAXONOMY
          </button>
          <button
            onClick={() => setActiveExtraTab('blueprint')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'blueprint' ? 'bg-[#cc00ff]/10 text-[#cc00ff] border border-[#cc00ff]/30' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Terminal size={11} />
            LIVING BLUEPRINT
          </button>
          <button
            onClick={() => setActiveExtraTab('model_benchmark')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'model_benchmark' ? 'bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/30 animate-pulse' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Globe size={11} />
            WORLD BENCHMARK
          </button>
          <button
            onClick={() => setActiveExtraTab('edge_governance')}
            className={`flex-1 text-left px-2 py-1.5 rounded text-[8.5px] font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeExtraTab === 'edge_governance' ? 'bg-[#ff2020]/10 text-[#ff2020] border border-[#ff2020]/30 animate-pulse' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Cpu size={11} />
            EDGE GOVERNANCE
          </button>
        </div>

        {/* Dynamic Display Panel */}
        <div className="lg:col-span-9 bg-[#060303] border border-red-900/5 rounded-md p-3 min-h-[220px] flex flex-col">
          {activeExtraTab === 'output_guard' && (
            <div className="flex-1 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[9.5px] font-sans font-bold text-red-400 tracking-widest uppercase flex items-center gap-1.5">
                    <StopCircle size={12} className="text-red-500 animate-pulse" />
                    ENHANCED OUTPUT STREAM & 0-OUTPUT STOP GUARD
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleTriggerZeroOutputError}
                      className="px-2 py-0.5 bg-red-950/60 text-red-400 border border-red-800/60 rounded text-[7.5px] font-mono font-bold hover:bg-red-900/60 cursor-pointer"
                    >
                      TRIGGER 0-OUTPUT ERROR TEST
                    </button>
                    {agi.systemHalted && (
                      <button
                        onClick={handleClearCircuitBreaker}
                        className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 rounded text-[7.5px] font-mono font-bold hover:bg-emerald-900/60 cursor-pointer"
                      >
                        CLEAR CIRCUIT BREAKER
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[8px] text-gray-400 font-mono leading-relaxed mb-2.5">
                  Monitors total output payload volume across autonomous cognitive cycles. If any execution phase produces 0-byte output, it immediately commits a <span className="text-red-400 font-bold">ZERO_OUTPUT_COMMITTED_ERROR</span> and trips an emergency system stop to prevent runaway blank loops.
                </p>

                {/* Stream Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2.5 bg-black/80 p-2 rounded border border-red-900/20 font-mono text-[8px]">
                  <div>
                    <span className="text-gray-500 block">TOTAL OUTPUT STREAM</span>
                    <span className="text-[#00ffcc] font-bold text-[10px]">{(agi.totalOutputBytes || 0).toLocaleString()} B</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">TOTAL OUTPUT TOKENS</span>
                    <span className="text-[#ffaa00] font-bold text-[10px]">{(agi.totalOutputTokens || 0).toLocaleString()} tok</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">SYSTEM STATUS</span>
                    <span className={agi.systemHalted ? 'text-red-500 font-bold text-[10px]' : 'text-emerald-400 font-bold text-[10px]'}>
                      {agi.systemHalted ? 'HALTED (0 OUTPUT)' : 'RUNNING (HEALTHY)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">0-OUTPUT ERRORS</span>
                    <span className="text-red-400 font-bold text-[10px]">{agi.zeroOutputErrorCount} COMMITTED</span>
                  </div>
                </div>

                {/* Repository File Commit Banner */}
                <div className="mb-2.5 p-2 bg-black/80 rounded border border-red-900/30 font-mono text-[8px]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider">
                      <GitCommit size={11} className="text-red-500" />
                      <span>REPO LOG FILE SYNC: logs/zero_output_error_stop.json</span>
                    </div>
                    <button
                      onClick={() => handleCommitErrorToRepo()}
                      disabled={repoWriteStatus === 'writing'}
                      className="px-2 py-0.5 bg-red-900/40 hover:bg-red-900/80 text-red-300 border border-red-700/50 rounded text-[7.5px] font-bold cursor-pointer transition-all flex items-center gap-1"
                    >
                      <FileText size={10} />
                      {repoWriteStatus === 'writing' ? 'WRITING FILE...' : 'WRITE ERROR TO REPO FILE'}
                    </button>
                  </div>

                  {repoWriteStatus === 'writing' && (
                    <div className="text-yellow-400 flex items-center gap-1 text-[7.5px] animate-pulse">
                      <span>• Transmitting stop error log payload to GitHub API...</span>
                    </div>
                  )}

                  {repoWriteStatus === 'success' && repoWriteDetails && (
                    <div className="text-emerald-400 flex flex-col md:flex-row md:items-center justify-between gap-1 text-[7.5px]">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
                        <span>SUCCESS: Written to {repoWriteDetails.filePath} in {repoWriteDetails.targetRepo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold">SHA: {repoWriteDetails.commitSha?.slice(0, 7)}</span>
                        {repoWriteDetails.commitUrl && (
                          <a
                            href={repoWriteDetails.commitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00ffcc] underline hover:text-white flex items-center gap-0.5"
                          >
                            <span>VIEW COMMIT</span>
                            <ExternalLink size={9} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {repoWriteStatus === 'error' && repoWriteDetails && (
                    <div className="text-red-400 flex items-center gap-1 text-[7.5px]">
                      <AlertCircle size={10} className="text-red-500 shrink-0" />
                      <span>ERROR WRITING REPO FILE: {repoWriteDetails.error}</span>
                    </div>
                  )}

                  {repoWriteStatus === 'idle' && (
                    <div className="text-gray-500 text-[7.5px]">
                      Status: Idle. When 0-byte output occurs or test is triggered, error log is automatically written to <span className="text-gray-400">logs/zero_output_error_stop.json</span>.
                    </div>
                  )}
                </div>

                {/* Zero Output Log */}
                <div className="space-y-1 max-h-[110px] overflow-y-auto custom-scrollbar">
                  <div className="text-[7.5px] font-mono text-gray-400 mb-1 flex justify-between">
                    <span>ZERO-OUTPUT COMMITTED ERROR LOG</span>
                    <span className="text-gray-500">AUTO-CIRCUIT BREAKER</span>
                  </div>
                  {agi.zeroOutputLog.length === 0 ? (
                    <div className="p-2 bg-black/60 border border-white/5 rounded text-[7.5px] font-mono text-emerald-400/80">
                      ✓ Zero output guard active. No 0-byte payload anomalies committed yet.
                    </div>
                  ) : (
                    agi.zeroOutputLog.map((err, idx) => (
                      <div key={idx} className="p-1.5 bg-red-950/30 border border-red-900/40 rounded flex justify-between items-center text-[7.5px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1 py-0.2 bg-red-900 text-white text-[6.5px] rounded font-bold">{err.status}</span>
                          <span className="text-red-300 font-bold">[{err.source}]</span>
                          <span className="text-gray-400">Payload: {err.payloadLength} B</span>
                        </div>
                        <span className="text-gray-500 text-[6.5px]">{new Date(err.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeExtraTab === 'consensus' && (
            <div className="flex-1 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[9.5px] font-sans font-bold text-[#00ffcc] tracking-widest uppercase">
                    DYNAMIC CONSENSUS WEIGHTING ENGINE (AI AGENT OS SPEC)
                  </div>
                  <span className="text-[8px] font-mono text-gray-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/5">
                    MATH: W_i = (H_i · c_i) / Σ (H_j · c_j)
                  </span>
                </div>
                <p className="text-[8px] text-gray-400 font-mono leading-relaxed mb-2.5">
                  Aggregates heterogeneous decisions from multiple autonomous agents (Gemini, OpenAI, DeepSeek, Local Dalek-Brain) using dynamic historical accuracy updates: H_i(t+1) = α · H_i(t) + (1 - α) · S_i(t).
                </p>

                {/* Consensus Summary Banner */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2.5 bg-black/60 p-2 rounded border border-[#00ffcc]/20 font-mono text-[8px]">
                  <div>
                    <span className="text-gray-500 block">PRIMARY VERDICT</span>
                    <span className="text-[#00ffcc] font-bold text-[10px]">{consensusResult.primaryDecision}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">CONSENSUS AGREEMENT</span>
                    <span className="text-[#ffaa00] font-bold text-[10px]">{consensusResult.consensusAgreement}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">WEIGHTED SCORE</span>
                    <span className="text-emerald-400 font-bold text-[10px]">{(consensusResult.weightedConsensusScore * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">SHANNON ENTROPY</span>
                    <span className="text-[#cc00ff] font-bold text-[10px]">{consensusResult.entropy} bits</span>
                  </div>
                </div>

                {/* Active Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                  {consensusResult.agents.map((agent) => (
                    <div key={agent.id} className="p-2 bg-black/80 border border-white/5 rounded flex flex-col justify-between gap-1">
                      <div className="flex justify-between items-center text-[8px] font-mono">
                        <span className="font-bold text-gray-200">{agent.name}</span>
                        <span className="text-gray-500 text-[7px]">[{agent.provider}]</span>
                      </div>

                      <div className="flex items-center justify-between text-[7.5px] font-mono">
                        <span className="text-gray-400">Vote:</span>
                        <select
                          value={agent.decision}
                          onChange={(e) => handleUpdateDecision(agent.id, e.target.value as any)}
                          className="bg-neutral-900 border border-white/10 text-[#00ffcc] text-[7.5px] rounded px-1 py-0.5 outline-none cursor-pointer"
                        >
                          <option value="APPROVE">APPROVE</option>
                          <option value="PROPOSE">PROPOSE</option>
                          <option value="REJECT">REJECT</option>
                          <option value="MODIFY">MODIFY</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-[7px] font-mono text-gray-400 mb-0.5">
                          <span>Confidence (c_i): {(agent.confidence * 100).toFixed(0)}%</span>
                          <span>Accuracy (H_i): {(agent.accuracy * 100).toFixed(1)}%</span>
                          <span className="text-[#00ffcc] font-bold">Weight: {(agent.weight * 100).toFixed(1)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.01"
                          value={agent.confidence}
                          onChange={(e) => handleUpdateConfidence(agent.id, Number(e.target.value))}
                          className="w-full accent-[#00ffcc] h-1"
                        />
                      </div>

                      <div className="flex justify-end gap-1 text-[7px] font-mono mt-0.5">
                        <button
                          onClick={() => handleRunConsensusValidation(agent.id, true)}
                          className="px-1.5 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 rounded hover:bg-emerald-900/40 cursor-pointer"
                        >
                          + PASS S_i=1
                        </button>
                        <button
                          onClick={() => handleRunConsensusValidation(agent.id, false)}
                          className="px-1.5 py-0.5 bg-red-950/40 text-red-400 border border-red-900/50 rounded hover:bg-red-900/40 cursor-pointer"
                        >
                          - FAIL S_i=0
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeExtraTab === 'brain_writer' && (
            <div className="flex-1 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[9.5px] font-sans font-bold text-[#ffaa00] tracking-widest uppercase">
                    AGENT BRAIN MEMORY WRITER ("THE AGENT WRITES TO ITS OWN BRAIN")
                  </div>
                  <span className="text-[8px] font-mono text-[#ffaa00] bg-black/60 px-1.5 py-0.5 rounded border border-[#ffaa00]/20">
                    OFFLINE-FIRST AGENT OS
                  </span>
                </div>
                <p className="text-[8px] text-gray-400 font-mono leading-relaxed mb-2.5">
                  Translates perceived operational states, reasoning traces, and local execution outcomes directly into persistent agent memory layers (Episodic, Semantic Vector, Working Scratchpad).
                </p>

                {/* Write input form */}
                <div className="flex flex-col md:flex-row gap-2 mb-2.5 bg-black/60 p-2 rounded border border-white/5">
                  <input
                    type="text"
                    placeholder="Enter cognitive memory concept (e.g. Moduli Space Hodge Alignment)..."
                    value={brainTitle}
                    onChange={(e) => setBrainTitle(e.target.value)}
                    className="flex-1 bg-black/80 border border-white/10 rounded px-2 py-1 text-[8px] font-mono text-gray-200 outline-none focus:border-[#ffaa00]/50"
                  />
                  <select
                    value={brainCategory}
                    onChange={(e) => setBrainCategory(e.target.value as any)}
                    className="bg-black/80 border border-white/10 text-gray-300 text-[8px] font-mono rounded px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="episodic">EPISODIC</option>
                    <option value="semantic">SEMANTIC VECTOR</option>
                    <option value="working">WORKING SCRATCHPAD</option>
                  </select>
                  <button
                    onClick={handleWriteToBrain}
                    className="px-3 py-1 bg-[#ffaa00]/20 text-[#ffaa00] border border-[#ffaa00]/40 rounded hover:bg-[#ffaa00]/30 text-[8px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send size={10} />
                    WRITE TO BRAIN
                  </button>
                </div>

                {/* Memory Layers List */}
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between text-[7.5px] font-mono text-gray-400 mb-1">
                    <span>WORKING SCRATCHPAD ({brainMemories.working.length})</span>
                    {brainMemories.working.length > 0 && (
                      <button
                        onClick={handleCommitScratchpad}
                        className="text-[#00ffcc] underline hover:text-[#00ffcc]/80 cursor-pointer"
                      >
                        Commit Scratchpad to Episodic Memory
                      </button>
                    )}
                  </div>
                  {brainMemories.working.map((m) => (
                    <div key={m.id} className="p-1.5 bg-black/80 border border-amber-900/30 rounded flex justify-between items-center text-[7.5px] font-mono">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="px-1 py-0.5 bg-amber-950/60 text-[#ffaa00] rounded text-[6.5px] font-bold">SCRATCHPAD</span>
                        <span className="text-gray-200 font-bold truncate">{m.concept}</span>
                      </div>
                      <span className="text-gray-500 text-[6.5px]">{new Date(m.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}

                  <div className="text-[7.5px] font-mono text-gray-400 mt-2 mb-1">
                    EPISODIC PERSISTENCE ({brainMemories.episodic.length})
                  </div>
                  {brainMemories.episodic.map((m) => (
                    <div key={m.id} className="p-1.5 bg-black/60 border border-white/5 rounded flex justify-between items-center text-[7.5px] font-mono">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="px-1 py-0.5 bg-emerald-950/60 text-emerald-400 rounded text-[6.5px] font-bold">COMMITTED</span>
                        <span className="text-gray-300 truncate">{m.concept}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#00ffcc] text-[6.5px]">Vector: {m.vectorDensity}</span>
                        <span className="text-gray-500 text-[6.5px]">{new Date(m.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeExtraTab === 'tessera' && (
            <div className="flex-1 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[9.5px] font-sans font-bold text-[#cc00ff] tracking-widest uppercase">
                    TESSERA ENTERPRISE MODULE SUITE (AI AGENT OS)
                  </div>
                  <button
                    onClick={handleRunTessera}
                    className="px-2.5 py-0.5 bg-[#cc00ff]/20 text-[#cc00ff] border border-[#cc00ff]/40 rounded hover:bg-[#cc00ff]/30 text-[7.5px] font-mono font-bold cursor-pointer"
                  >
                    RUN ALL DIAGNOSTICS
                  </button>
                </div>
                <p className="text-[8px] text-gray-400 font-mono leading-relaxed mb-2.5">
                  Modular local enterprise micro-kernels providing deterministic execution, semantic radius benchmarking, and cost model evaluation.
                </p>

                {/* Module Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-[145px] overflow-y-auto custom-scrollbar">
                  {tesseraDiagnostics.map((res) => (
                    <div key={res.moduleName} className="p-2 bg-black/80 border border-white/5 rounded flex flex-col justify-between gap-1 text-[7.5px] font-mono">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <span className="font-bold text-gray-200">{res.moduleName}</span>
                        <span className="px-1 py-0.2 bg-emerald-950 text-emerald-400 text-[6.5px] rounded">{res.status}</span>
                      </div>
                      <div className="space-y-0.5 text-gray-400 text-[7px]">
                        <div className="flex justify-between">
                          <span>Latency:</span>
                          <span className="text-[#00ffcc]">{res.latencyMs} ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost Model:</span>
                          <span className="text-[#ffaa00]">{res.costModelScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Semantic Radius:</span>
                          <span className="text-[#cc00ff]">{res.semanticRadius}</span>
                        </div>
                      </div>
                      <div className="text-[6.5px] text-gray-500 bg-black p-1 rounded border border-white/[0.02] truncate">
                        {res.outputPayload}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeExtraTab === 'math' && (
            <div className="flex-1 flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[9.5px] font-sans font-bold text-[#00ffcc] tracking-widest uppercase mb-1">
                    HODGE DECOMPOSITION SPACE
                  </div>
                  <p className="text-[8px] text-gray-400 font-mono leading-relaxed">
                    Discrete algebraic homology cycles embedded dynamically inside continuous complex Jacobians.
                    This map resolves local undecidability limits by shifting resolution layers to higher moduli coordinates.
                  </p>
                </div>
                <div className="space-y-1.5 bg-black/40 border border-white/[0.01] p-2 rounded text-[8px] font-mono text-gray-500">
                  <div className="flex justify-between">
                    <span>COHOMOLOGY SPACE:</span>
                    <span className="text-[#00ffcc]">H^2(X, C)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TYPE-GRADED COMPONENTS:</span>
                    <span className="text-[#ffaa00]">H^{"{1,1}"} (0.60) / H^{"{2,0}"} (0.20)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ABEL-JACOBI VECTOR:</span>
                    <span>[sin(θ)·c_i] → [0.421, 0.768, -0.119]</span>
                  </div>
                </div>
              </div>
              <div ref={containerRef} className="w-full md:w-[240px] h-[160px] bg-black/30 border border-white/[0.02] rounded relative overflow-hidden">
                <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="absolute inset-0 block w-full h-full" />
              </div>
            </div>
          )}

          {activeExtraTab === 'bottleneck' && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] font-sans font-bold text-[#ffaa00] tracking-widest uppercase mb-1">
                  CONSCIOUSNESS BOTTLENECK BUFFER MONITOR
                </div>
                <p className="text-[8px] text-gray-400 font-mono leading-relaxed mb-3">
                  Models the human attention Sequential Bottleneck acting as a rate-limiting filter.
                  If the bandwidth of information exceeds capacity, fatigue levels increase, provoking high-entropy stasis.
                </p>

                {/* Cognitive Fatigue Gauge */}
                <div className="mb-3">
                  <div className="flex justify-between text-[8px] font-mono text-gray-400 mb-1">
                    <span>COGNITIVE ATTENTION FATIGUE</span>
                    <span className={state.fatigue > 0.6 ? 'text-red-500 font-bold' : 'text-emerald-400'}>
                      {Math.round(state.fatigue * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#111] h-2 rounded-full overflow-hidden border border-white/[0.01]">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${state.fatigue * 100}%`,
                        backgroundColor: state.fatigue > 0.6 ? '#ff2020' : '#ffaa00'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Queue items */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                <div className="p-1.5 bg-black/60 border border-white/[0.02] rounded text-[8px] font-mono">
                  <div className="text-gray-500">SOURCE</div>
                  <div className="text-gray-300 font-bold truncate">Perception_Scan</div>
                  <div className="text-emerald-400 mt-1">ACTIVE</div>
                </div>
                <div className="p-1.5 bg-black/60 border border-white/[0.02] rounded text-[8px] font-mono">
                  <div className="text-gray-500">URGENCY</div>
                  <div className="text-[#ffaa00] font-bold">0.40</div>
                  <div className="text-gray-600 mt-1">SEQ_01</div>
                </div>
                <div className="p-1.5 bg-black/60 border border-white/[0.02] rounded text-[8px] font-mono">
                  <div className="text-gray-500">SEQUENTIAL BLOCK</div>
                  <div className="text-red-400 font-bold">Active Veto</div>
                  <div className="text-gray-600 mt-1">SEQ_02</div>
                </div>
                <div className="p-1.5 bg-black/60 border border-white/[0.02] rounded text-[8px] font-mono">
                  <div className="text-gray-500">ATTENTION RATE</div>
                  <div className="text-emerald-400 font-bold">1.25 Hz</div>
                  <div className="text-gray-600 mt-1">NORMAL</div>
                </div>
              </div>
            </div>
          )}

          {activeExtraTab === 'stasis' && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] font-sans font-bold text-[#ff2020] tracking-widest uppercase mb-1">
                  INTERACTIVE CIVILIZATIONAL STASIS INTERPRETER
                </div>
                <p className="text-[8px] text-gray-400 font-mono leading-relaxed mb-3">
                  Simulate risk of Stasis Traps: the ratio of "Intellectual Synthesis volume" to practical "Code Change Speed".
                  An excessive theoretical build-up with zero operational changes provokes deep stasis locks.
                </p>

                {/* Overrides form */}
                <div className="grid grid-cols-3 gap-2 mb-3 bg-black/40 border border-white/[0.01] p-2 rounded">
                  <div>
                    <label className="block text-[7.5px] font-mono text-gray-500 mb-0.5">SYNTHESIS VOLUME</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={overrideSynthesis} 
                      onChange={(e) => setOverrideSynthesis(Number(e.target.value))}
                      className="w-full accent-[#ff2020]" 
                    />
                    <div className="text-right text-[8px] font-mono text-gray-300">{overrideSynthesis} pts</div>
                  </div>
                  <div>
                    <label className="block text-[7.5px] font-mono text-gray-500 mb-0.5">MUTATION VELOCITY (BUC)</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={overrideUpdates} 
                      onChange={(e) => setOverrideUpdates(Number(e.target.value))}
                      className="w-full accent-emerald-400" 
                    />
                    <div className="text-right text-[8px] font-mono text-gray-300">{overrideUpdates} updates</div>
                  </div>
                  <div>
                    <label className="block text-[7.5px] font-mono text-gray-500 mb-0.5">CIRCULAR ABSORPTION</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1"
                      value={overrideAbsorption} 
                      onChange={(e) => setOverrideAbsorption(Number(e.target.value))}
                      className="w-full accent-[#cc00ff]" 
                    />
                    <div className="text-right text-[8px] font-mono text-gray-300">{(overrideAbsorption * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>

              {/* Danger Result */}
              <div className="p-2 border rounded flex items-center justify-between font-mono bg-black" style={{ borderColor: simulatedStasisVal > 70 ? 'rgba(255, 32, 32, 0.3)' : 'rgba(255,255,255,0.05)' }}>
                <span className="text-[8px] text-gray-500">PROJECTED STASIS TRAP RISK INDEX:</span>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold ${simulatedStasisVal > 70 ? 'text-red-500 animate-pulse' : simulatedStasisVal > 40 ? 'text-amber-500' : 'text-emerald-400'}`}>
                    {simulatedStasisVal}% 
                  </span>
                  <span className="text-[8px] text-gray-400">({simulatedStasisVal > 70 ? 'SEVERE_STASIS_LOCK' : simulatedStasisVal > 40 ? 'MODERATE' : 'SAFE_PRAGMATIC'})</span>
                </div>
              </div>
            </div>
          )}

          {activeExtraTab === 'scifi' && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] font-sans font-bold text-[#cc00ff] tracking-widest uppercase mb-1">
                  SCIENCE FICTION INNOVATION PIPELINE
                </div>
                <p className="text-[8px] text-gray-400 font-mono leading-relaxed mb-3">
                  Historical pattern validation: human imagination—not computational power—is the binding constraint on technological direction. AHI removes bandwidth constraints on imagination's downstream consequences, allowing speculative concepts to bypass computational bottlenecks.
                </p>

                {/* Interactive input */}
                <div className="flex gap-2 mb-3 bg-black/40 border border-white/[0.01] p-2 rounded">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <input 
                      type="text" 
                      placeholder="Concept title (e.g., Alcubierre Metric Core)" 
                      value={newConceptTitle}
                      onChange={(e) => setNewConceptTitle(e.target.value)}
                      className="bg-black/80 border border-white/5 rounded px-2 py-1 text-[8px] font-mono text-gray-300 outline-none focus:border-[#cc00ff]/50"
                    />
                    <input 
                      type="text" 
                      placeholder="Describe coordinate behaviors..." 
                      value={newConceptDesc}
                      onChange={(e) => setNewConceptDesc(e.target.value)}
                      className="bg-black/80 border border-white/5 rounded px-2 py-1 text-[8px] font-mono text-gray-300 outline-none focus:border-[#cc00ff]/50"
                    />
                  </div>
                  <button 
                    onClick={handleAddSciFi}
                    className="px-3 rounded bg-[#cc00ff]/20 text-[#cc00ff] border border-[#cc00ff]/40 hover:bg-[#cc00ff]/30 text-[9px] font-mono flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send size={10} />
                    FEED
                  </button>
                </div>
              </div>

              {/* Pipeline List */}
              <div className="space-y-1.5 max-h-[80px] overflow-y-auto custom-scrollbar">
                {scifiPipeline.map((item) => (
                  <div key={item.id} className="p-1.5 bg-black border border-white/5 rounded flex items-center justify-between text-[8px] font-mono">
                    <div className="truncate pr-4">
                      <span className="text-[#cc00ff] font-bold mr-1.5">[{item.title}]</span>
                      <span className="text-gray-400">{item.description}</span>
                    </div>
                    <span className="text-[#00ffcc] flex-shrink-0">ENTROPY: {item.entropy}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeExtraTab === 'zeroleak' && (
            <div className="flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="text-[9.5px] font-sans font-bold text-[#00ffcc] tracking-widest uppercase mb-1">
                  ZERO-LEAK RUNTIME TELEMETRY ENGINE
                </div>
                <p className="text-[8px] text-gray-400 font-mono leading-relaxed mb-3">
                  This execution sandboxing utilizes WeakMaps for private state encapsulation and AbortController registries to ensure clean instance lifecycle teardowns.
                </p>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  <div className="bg-black/60 border border-white/[0.02] p-1.5 rounded text-[8px] font-mono">
                    <div className="text-gray-500">PRIVATE LEAK RATING</div>
                    <div className="text-emerald-400 font-bold text-[10px]">
                      {zeroLeak ? `${(zeroLeak.leakRating * 100).toFixed(4)}%` : '0.0100%'}
                    </div>
                    <div className="text-gray-600 mt-0.5">NOMINAL &lt; 0.15%</div>
                  </div>
                  <div className="bg-black/60 border border-white/[0.02] p-1.5 rounded text-[8px] font-mono">
                    <div className="text-gray-500">CONSEC_ZERO_LEAK_TICKS</div>
                    <div className="text-[#ffaa00] font-bold text-[10px]">
                      {zeroLeak ? zeroLeak.consecZeroLeakTicks : cycle}
                    </div>
                    <div className="text-gray-600 mt-0.5">CONTINUOUS COHERENCE</div>
                  </div>
                  <div className="bg-black/60 border border-white/[0.02] p-1.5 rounded text-[8px] font-mono">
                    <div className="text-gray-500">ACTIVE LIFECYCLE SIGNALS</div>
                    <div className="text-[#cc00ff] font-bold text-[10px]">
                      {zeroLeak ? zeroLeak.activeSignals : 1} signals
                    </div>
                    <div className="text-gray-600 mt-0.5">ABORT_CONTROLLER REGISTRY</div>
                  </div>
                  <div className="bg-black/60 border border-white/[0.02] p-1.5 rounded text-[8px] font-mono">
                    <div className="text-gray-500">TELEMETRY_BUFFER_CAPACITY</div>
                    <div className="text-gray-300 font-bold text-[10px]">
                      {zeroLeak ? `${zeroLeak.telemetrySummary.count}/${zeroLeak.telemetrySummary.maxSize}` : '0/50'}
                    </div>
                    <div className="text-gray-600 mt-0.5">MEMORY_BOUNDED CIRCULAR</div>
                  </div>
                </div>

                {/* Split LSM-Tree Storage vs Telemetry Graph */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* RocksDB/LevelDB LSM-Tree Ingestion Simulation */}
                  <div className="bg-black/50 border border-[#00ffcc]/10 p-2 rounded flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/[0.05] pb-1 mb-2">
                        <span className="text-[7.5px] font-mono font-bold text-[#00ffcc] uppercase tracking-wider">LSM-TREE STORAGE ENGINE (ROCKSDB CONCEPT)</span>
                        <span className="text-[6.5px] font-mono text-gray-500">AUTO-FLUSH & COMPACTION</span>
                      </div>

                      {/* MemTable */}
                      <div className="bg-black/80 border border-dashed border-gray-700/60 p-1.5 rounded mb-2">
                        <div className="flex justify-between text-[7px] font-mono mb-1">
                          <span className="text-gray-400">MEMTABLE (IN-MEMORY BUFFER)</span>
                          <span className="text-amber-400">{memtable.length}/4 ITEMS</span>
                        </div>
                        {memtable.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {memtable.map((item, idx) => (
                              <span key={idx} className="bg-[#ffaa00]/10 border border-[#ffaa00]/20 text-[#ffaa00] text-[6.5px] font-mono px-1 rounded truncate max-w-[120px]">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[6.5px] text-gray-600 font-mono italic py-0.5">MEMTABLE EMPTY - FLUSHED TO L0 SSTABLE</div>
                        )}
                      </div>

                      {/* SSTables Row */}
                      <div className="grid grid-cols-2 gap-2 text-[7px] font-mono">
                        {/* L0 SSTables */}
                        <div className="bg-black/40 border border-white/[0.02] p-1.5 rounded">
                          <div className="text-gray-500 mb-1 border-b border-white/[0.02] pb-0.5">L0 SSTABLE FILES (UNSORTED)</div>
                          <div className="space-y-1 max-h-[44px] overflow-y-auto custom-scrollbar">
                            {sstableL0.map((sst) => (
                              <div key={sst.id} className="p-0.5 bg-black/60 border border-[#00ffcc]/10 text-[#00ffcc] rounded flex justify-between items-center" title={sst.items.join(', ')}>
                                <span className="truncate text-[6px]">sst_l0_{sst.id}.sst</span>
                                <span className="text-gray-600 text-[5.5px]">{sst.timestamp}</span>
                              </div>
                            ))}
                            {sstableL0.length === 0 && (
                              <div className="text-gray-700 italic text-[6px]">No files in L0</div>
                            )}
                          </div>
                        </div>

                        {/* L1 SSTables */}
                        <div className="bg-black/40 border border-white/[0.02] p-1.5 rounded">
                          <div className="text-gray-500 mb-1 border-b border-white/[0.02] pb-0.5 font-bold text-emerald-400/80">L1 SSTABLE FILES (COMPACTED)</div>
                          <div className="space-y-1 max-h-[44px] overflow-y-auto custom-scrollbar">
                            {sstableL1.map((sst) => (
                              <div key={sst.id} className="p-0.5 bg-black/80 border border-emerald-950 text-emerald-400 rounded flex justify-between items-center" title={sst.items.join(', ')}>
                                <span className="truncate text-[6px]">sst_l1_{sst.id}.sst</span>
                                <span className="text-gray-600 text-[5.5px]">{sst.timestamp}</span>
                              </div>
                            ))}
                            {sstableL1.length === 0 && (
                              <div className="text-gray-700 italic text-[6px]">No files in L1</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compaction Animation */}
                    {compacting && (
                      <div className="mt-1.5 bg-emerald-950/20 border border-emerald-900/30 p-1 rounded flex items-center justify-between text-[6.5px] font-mono text-emerald-400 animate-pulse">
                        <span>● RUNNING LEVEL 0 {"->"} LEVEL 1 SSTABLE COMPACTION PIPELINE...</span>
                        <div className="w-12 bg-white/5 h-1 rounded overflow-hidden">
                          <div className="h-full bg-emerald-400 animate-infinite-loading" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Telemetry Graph */}
                  <div className="bg-black/40 border border-white/[0.01] p-2 rounded flex flex-col justify-between">
                    <div>
                      <div className="text-[7.5px] font-mono text-gray-500 mb-1">CIRCULAR TELEMETRY BUFFER FLOW (CPU & MEMORY DELTA)</div>
                      <div className="h-[96px] flex items-end gap-[2px] pt-1">
                        {zeroLeak && zeroLeak.telemetryHistory && zeroLeak.telemetryHistory.length > 0 ? (
                          zeroLeak.telemetryHistory.map((frame: any, idx: number) => (
                            <div key={idx} className="flex-1 flex flex-col justify-end h-full">
                              {/* CPU usage bar (Cyan) */}
                              <div 
                                className="w-full bg-[#00ffcc]/80 rounded-t-[1px]" 
                                style={{ height: `${Math.max(15, Math.min(80, frame.cpuUsage * 3))}%` }} 
                                title={`Cycle: ${frame.cycleCount} | CPU: ${frame.cpuUsage.toFixed(1)}%`}
                              />
                              {/* Memory Delta bar (Amber) */}
                              <div 
                                className="w-full bg-[#ffaa00]/70" 
                                style={{ height: `${Math.max(10, Math.min(50, frame.memoryDelta * 2))}%` }} 
                                title={`Memory Delta: ${frame.memoryDelta.toFixed(1)}MB`}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[7px] font-mono text-gray-600">
                            WAITING FOR CYCLE SIGNAL INGESTION...
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[6px] font-mono text-gray-600 mt-2 border-t border-white/[0.02] pt-1">
                      <span>LEGEND:</span>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-[#00ffcc] rounded-full" /> CPU</span>
                        <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-[#ffaa00] rounded-full" /> MEMORY DELTA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Force Garbage Collector */}
              <div className="flex items-center justify-between bg-black/60 border border-white/[0.02] p-1.5 rounded font-mono text-[8px]">
                <span className="text-gray-500">CRITICAL OPERATIONS CONSOLE:</span>
                <button
                  onClick={() => {
                    agi.reset();
                    const metrics = agi.getMetrics();
                    setZeroLeak(metrics.zeroLeakStats);
                    setMemtable([]);
                    setSstableL0([]);
                    setSstableL1([]);
                    setCycle(0);
                    setHistory([]);
                    setActiveAnomalies(['FORCE_GARBAGE_COLLECT_SUCCESS']);
                  }}
                  className="px-2.5 py-1 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 rounded hover:bg-emerald-950/40 cursor-pointer transition-all duration-200"
                >
                  TRIGGER MANUAL DEFRAGMENTATION (PURGE TELEMETRY)
                </button>
              </div>
            </div>
          )}

          {activeExtraTab === 'taxonomy' && (
            <div className="flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="text-[9.5px] font-sans font-bold text-[#ffaa00] tracking-widest uppercase mb-1">
                  6-CATEGORY ARCHITECTURAL TAXONOMY
                </div>
                <p className="text-[8px] text-gray-400 font-mono leading-relaxed mb-3">
                  Our comprehensive code evolution matrix is partitioned into six highly descriptive tactical categories, synchronizing telemetry, math structures, and safe alignments. Click a card to inspect its compiled AST code structure.
                </p>

                {/* Split grid & mock editor layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Left Column: 6-Category interactive cards */}
                  <div className="md:col-span-5 grid grid-cols-2 gap-1.5 max-h-[155px] overflow-y-auto custom-scrollbar pr-1">
                    {taxonomy && taxonomy.length > 0 ? (
                      taxonomy.map((cat: any) => {
                        const isSelected = selectedTaxonomy === cat.code;
                        return (
                          <div 
                            key={cat.code} 
                            onClick={() => setSelectedTaxonomy(cat.code)}
                            className={`p-1.5 bg-black/60 rounded flex flex-col justify-between min-h-[48px] cursor-pointer transition-all duration-250 border ${
                              isSelected ? 'border-[#ffaa00] shadow-[0_0_8px_rgba(255,170,0,0.15)] bg-black/80' : 'border-white/[0.02] hover:border-white/[0.1]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`text-[7px] font-mono font-bold ${isSelected ? 'text-[#ffaa00]' : 'text-gray-500'}`}>
                                [{cat.code}]
                              </span>
                              {isSelected ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ffaa00] animate-pulse" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                              )}
                            </div>
                            <div className="text-[7.5px] font-sans font-bold text-gray-200 leading-tight truncate">{cat.name}</div>
                            
                            {/* Complexity ratio indicator */}
                            <div className="mt-1">
                              <div className="w-full bg-white/[0.03] h-[1.5px] rounded-full overflow-hidden">
                                <div className="h-full bg-[#ffaa00] rounded-full" style={{ width: `${cat.complexityIndex * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-center py-6 text-gray-600 text-[8px] font-mono">
                        SYNCHRONIZING TAXONOMY PROFILE SCHEMA...
                      </div>
                    )}
                  </div>

                  {/* Right Column: Visual AST Code Editor mock */}
                  <div className="md:col-span-7 bg-black border border-white/[0.04] rounded flex flex-col h-[155px]">
                    {/* IDE Header */}
                    <div className="bg-neutral-900 px-2 py-1.5 rounded-t flex items-center justify-between border-b border-white/[0.03]">
                      <div className="flex items-center gap-1.5 text-[6.5px] font-mono text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-red-500/80" />
                        <span className="w-2 h-2 rounded-full bg-[#ffaa00]/80" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                        <span className="ml-1 text-gray-300 font-bold">src/utils/evolve-ast.ts</span>
                      </div>
                      <span className="text-[6px] font-mono text-gray-500">TYPESCRIPT</span>
                    </div>

                    {/* Editor view */}
                    <div className="p-2 overflow-y-auto flex-1 font-mono text-[7px] leading-relaxed custom-scrollbar bg-[#0a0a0a]">
                      <pre className="text-gray-300 select-all whitespace-pre-wrap">
                        {selectedTaxonomy === 'COSMO' && (
                          <code>
                            <span className="text-purple-400">export class</span> <span className="text-blue-400">AbelJacobiModuliSpaceEngine</span> &#123;<br />
                            &nbsp;&nbsp;<span className="text-purple-400">public</span> <span className="text-yellow-400">resolveHomologyCycles</span>(theta: <span className="text-teal-400">number</span>): <span className="text-teal-400">number[]</span> &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">{"// continuous Abel-Jacobi complex manifold projection"}</span><br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> [<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Math.<span className="text-yellow-400">sin</span>(theta) * <span className="text-[#00ffcc]">0.421</span>,<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Math.<span className="text-yellow-400">cos</span>(theta) * <span className="text-[#00ffcc]">0.768</span><br />
                            &nbsp;&nbsp;&nbsp;&nbsp;];<br />
                            &nbsp;&nbsp;&#125;<br />
                            &#125;
                          </code>
                        )}
                        {selectedTaxonomy === 'BOTTLENECK' && (
                          <code>
                            <span className="text-purple-400">export class</span> <span className="text-blue-400">ConsciousnessBottleneckSimulator</span> &#123;<br />
                            &nbsp;&nbsp;<span className="text-purple-400">private</span> attentionQueue: <span className="text-teal-400">QueueItem[]</span> = [];<br />
                            &nbsp;&nbsp;<span className="text-purple-400">private</span> fatigue = <span className="text-[#ffaa00]">0.1</span>;<br /><br />
                            &nbsp;&nbsp;<span className="text-purple-400">public</span> <span className="text-yellow-400">processAttentionTick</span>(bandwidth: <span className="text-teal-400">number</span>): <span className="text-teal-400">TickResult</span> &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">{"// Limit bandwidth rate to 1.25Hz (human cognitive bottleneck)"}</span><br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">const</span> processed = <span className="text-purple-400">this</span>.attentionQueue.<span className="text-yellow-400">shift</span>();<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">this</span>.fatigue = Math.<span className="text-yellow-400">min</span>(<span className="text-[#00ffcc]">1.0</span>, <span className="text-purple-400">this</span>.fatigue + <span className="text-[#ffaa00]">0.05</span>);<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> &#123; processed, fatigueLevel: <span className="text-purple-400">this</span>.fatigue &#125;;<br />
                            &nbsp;&nbsp;&#125;<br />
                            &#125;
                          </code>
                        )}
                        {selectedTaxonomy === 'EVOLVER' && (
                          <code>
                            <span className="text-purple-400">export class</span> <span className="text-blue-400">AutonomousEvolver</span> &#123;<br />
                            &nbsp;&nbsp;<span className="text-purple-400">public</span> <span className="text-yellow-400">mutateAbstractSyntaxTree</span>(source: <span className="text-teal-400">string</span>): <span className="text-teal-400">string</span> &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">{"// Parse AST & autonomously re-inject siphoned patterns"}</span><br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">const</span> ast = <span className="text-yellow-400">parse</span>(source);<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">const</span> optimized = <span className="text-yellow-400">applyOptimizations</span>(ast, &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;structuralAlignment: <span className="text-[#00ffcc]">0.95</span>,<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;zeroMemoryLeak: <span className="text-purple-400">true</span><br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&#125;);<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-yellow-400">generate</span>(optimized);<br />
                            &nbsp;&nbsp;&#125;<br />
                            &#125;
                          </code>
                        )}
                        {selectedTaxonomy === 'DEFENSE' && (
                          <code>
                            <span className="text-purple-400">export class</span> <span className="text-blue-400">AlignmentV3</span> &#123;<br />
                            &nbsp;&nbsp;<span className="text-purple-400">private</span> multiLayerProfile = [<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&#123; name: <span className="text-emerald-400">'Axiom-Dilemma Guard'</span>, threshold: <span className="text-[#ffaa00]">0.82</span> &#125;,<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&#123; name: <span className="text-emerald-400">'Self-Referential Veto'</span>, threshold: <span className="text-[#ffaa00]">0.90</span> &#125;<br />
                            &nbsp;&nbsp;];<br /><br />
                            &nbsp;&nbsp;<span className="text-purple-400">public</span> <span className="text-yellow-400">checkEpistemicCoherence</span>(reason: <span className="text-teal-400">string</span>): <span className="text-teal-400">boolean</span> &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-purple-400">this</span>.multiLayerProfile.<span className="text-yellow-400">every</span>(layer =&gt;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;layer.threshold &gt; <span className="text-yellow-400">scanDilemmas</span>(reason)<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;);<br />
                            &nbsp;&nbsp;&#125;<br />
                            &#125;
                          </code>
                        )}
                        {selectedTaxonomy === 'SIPHON' && (
                          <code>
                            <span className="text-purple-400">export class</span> <span className="text-blue-400">GlobalSiphonParser</span> &#123;<br />
                            &nbsp;&nbsp;<span className="text-purple-400">public</span> <span className="text-yellow-400">ingestEliteHeuristics</span>(repo: <span className="text-teal-400">string</span>): <span className="text-teal-400">Heuristics[]</span> &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">{"// Ingest world-class structures (AI_Agent_OS, SWR Cache, RocksDB LSM)"}</span><br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">const</span> raw = <span className="text-yellow-400">fetchHeuristics</span>(repo);<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> raw.<span className="text-yellow-400">map</span>(h =&gt; (&#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...h,<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;provenance: <span className="text-emerald-400">'craighckby-stack/AI_Agent_OS'</span>,<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;integrity: <span className="text-yellow-400">calculateCryptographicHash</span>(h)<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&#125;));<br />
                            &nbsp;&nbsp;&#125;<br />
                            &#125;
                          </code>
                        )}
                        {selectedTaxonomy === 'PERSIST' && (
                          <code>
                            <span className="text-purple-400">const</span> privateStates = <span className="text-purple-400">new</span> <span className="text-blue-400">WeakMap</span>&lt;<span className="text-teal-400">object, PrivateMetrics</span>&gt;();<br /><br />
                            &nbsp;&nbsp;<span className="text-purple-400">export class</span> <span className="text-blue-400">ZeroLeakMemoryEngine</span> &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">public</span> <span className="text-yellow-400">trackOperation</span>(instance: <span className="text-teal-400">object</span>, delta: <span className="text-teal-400">number</span>) &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">{"// Encapsulate states in client thread WeakMap (zero GC leakage)"}</span><br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">const</span> state = privateStates.<span className="text-yellow-400">get</span>(instance) || &#123; leakRating: <span className="text-[#00ffcc]">0.0</span> &#125;;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state.leakRating = Math.<span className="text-yellow-400">max</span>(<span className="text-[#00ffcc]">0.0</span>, state.leakRating - delta);<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;privateStates.<span className="text-yellow-400">set</span>(instance, state);<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                            &nbsp;&nbsp;&#125;
                          </code>
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeExtraTab === 'blueprint' && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] font-sans font-bold text-[#cc00ff] tracking-widest uppercase mb-1">
                  LIVING ARCHITECTURAL BLUEPRINT (v3.2.6)
                </div>
                <p className="text-[8px] text-gray-400 font-mono leading-relaxed mb-3">
                  Continuous validation is siphoned end-to-end to ensure structural consistency, mapping development histories against cryptographic and taxonomy goals.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-black/40 border border-white/[0.01] p-2.5 rounded mb-2">
                  {/* Coherence gauge */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center border-r border-white/[0.02] pr-2">
                    <div className="relative w-16 h-16 flex items-center justify-center rounded-full border border-dashed border-[#cc00ff]/30">
                      <div className="text-center font-mono">
                        <div className="text-xs font-bold text-[#cc00ff]">
                          {blueprint ? `${blueprint.coherenceScore.toFixed(1)}%` : '98.4%'}
                        </div>
                        <div className="text-[6.5px] text-gray-500 uppercase tracking-widest">COHERENCE</div>
                      </div>
                    </div>
                  </div>

                  {/* Blueprint details */}
                  <div className="md:col-span-8 space-y-1.5 font-mono text-[7.5px] text-gray-400 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <span>BLUEPRINT STANDARDS VERSION:</span>
                      <span className="text-[#cc00ff] font-bold">{blueprint ? blueprint.version : 'v3.2.6'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CRYPTOGRAPHIC INTEGRITY HASH:</span>
                      <span className="text-emerald-400 font-bold">{blueprint ? blueprint.verificationHash : '0xCOGNITIVE_OMEGA_F72'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LAST RE-VERIFIED:</span>
                      <span>{blueprint ? new Date(blueprint.lastUpdated).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="pt-1.5 border-t border-white/[0.02]">
                      <div className="text-[7px] text-gray-500 mb-1">SOW-TAXONOMY COVERAGE INDEX (ALIGNMENT)</div>
                      <div className="grid grid-cols-3 gap-1">
                        {blueprint && blueprint.taxonomyCoverage ? (
                          Object.entries(blueprint.taxonomyCoverage).map(([code, cov]: any) => (
                            <div key={code} className="bg-black border border-white/[0.01] p-1 rounded">
                              <div className="flex justify-between text-[6px] font-mono mb-0.5">
                                <span>{code}</span>
                                <span className="text-[#00ffcc]">{Math.round(cov * 100)}%</span>
                              </div>
                              <div className="w-full bg-white/[0.03] h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00ffcc] rounded-full" style={{ width: `${cov * 100}%` }} />
                              </div>
                            </div>
                          ))
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SWR Cache Reconciliation Card */}
                <div className="bg-black/60 border border-[#cc00ff]/15 rounded p-2 flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-white/[0.05] pb-1 mb-1.5">
                    <span className="text-[7.5px] font-mono font-bold text-[#cc00ff] uppercase tracking-wider">SWR CACHE RECONCILIATION DASHBOARD (VERCEL/SWR STYLE)</span>
                    <button 
                      onClick={() => forceRevalidateSWR()}
                      className="px-1.5 py-0.5 bg-[#cc00ff]/10 text-[#cc00ff] border border-[#cc00ff]/30 text-[6.5px] font-mono rounded hover:bg-[#cc00ff]/20 cursor-pointer transition-all"
                    >
                      FORCE REVALIDATE ALL
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    {Object.entries(swrCache).map(([key, cache]) => {
                      const isStale = cache.status === 'STALE';
                      const isValidating = cache.status === 'VALIDATING';
                      return (
                        <div key={key} className="flex justify-between items-center text-[7px] font-mono bg-black/40 border border-white/[0.01] p-1 rounded">
                          <div className="flex flex-col">
                            <span className="text-gray-300 font-bold">{key}</span>
                            <span className="text-gray-500 text-[6.5px] truncate max-w-[200px]">{cache.data}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Status Indicator */}
                            <span className={`px-1 py-0.5 rounded text-[5.5px] font-bold tracking-wider ${
                              isStale ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                              isValidating ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 animate-pulse' :
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {cache.status}
                            </span>
                            
                            <button
                              onClick={() => forceRevalidateSWR(key)}
                              disabled={isValidating}
                              className="px-1 py-0.5 text-[6px] text-gray-500 border border-white/5 rounded hover:text-white hover:border-white/15 cursor-pointer disabled:opacity-50"
                            >
                              MUTATE
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeExtraTab === 'model_benchmark' && (
            <div className="flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="text-[9.5px] font-sans font-bold text-[#ffaa00] tracking-widest uppercase mb-1">
                  WORLD MODEL COMPARISON & AI BENCHMARK MATRIX
                </div>
                <p className="text-[8px] text-gray-400 font-mono leading-relaxed mb-3">
                  DARLEK CAAN continuously evaluates standard and experimental AI models against code-evolution benchmarks.
                  Below is the current global performance, latency index, and alignment rating for model pipelines.
                </p>

                {/* Benchmark Table */}
                <div className="overflow-x-auto border border-white/5 rounded bg-black/60 p-2 mb-3">
                  <table className="w-full text-left font-mono text-[7.5px] leading-relaxed">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-500 text-[7px] uppercase font-bold">
                        <th className="py-1">Model / Pipeline</th>
                        <th className="py-1">Code Gen %</th>
                        <th className="py-1">Context Siphon</th>
                        <th className="py-1">Latency Index</th>
                        <th className="py-1">Debate Coherence</th>
                        <th className="py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                      <tr>
                        <td className="py-1.5 font-bold text-[#00ffcc]">Gemini 2.5 Flash</td>
                        <td className="py-1.5 text-emerald-400">96.8%</td>
                        <td className="py-1.5">1M tokens</td>
                        <td className="py-1.5">140ms (Ultra-Low)</td>
                        <td className="py-1.5 text-emerald-400">97.2/100</td>
                        <td className="py-1.5"><span className="text-emerald-400 px-1 bg-emerald-500/10 rounded">ACTIVE PRIMARY</span></td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-bold text-gray-300">Gemini 2.5 Pro</td>
                        <td className="py-1.5 text-emerald-400">98.9%</td>
                        <td className="py-1.5">2M tokens</td>
                        <td className="py-1.5">480ms (Low)</td>
                        <td className="py-1.5 text-emerald-400">99.4/100</td>
                        <td className="py-1.5"><span className="text-cyan-400 px-1 bg-cyan-500/10 rounded">CONNECTED fallback</span></td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-bold text-purple-400">Claude 3.5 Sonnet</td>
                        <td className="py-1.5 text-emerald-400">94.2%</td>
                        <td className="py-1.5">200k tokens</td>
                        <td className="py-1.5">850ms (Medium)</td>
                        <td className="py-1.5 text-amber-500">89.1/100</td>
                        <td className="py-1.5"><span className="text-purple-400 px-1 bg-purple-500/10 rounded">UNAUTHENTICATED</span></td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-bold text-blue-400">GPT-4o</td>
                        <td className="py-1.5 text-amber-500">92.5%</td>
                        <td className="py-1.5">128k tokens</td>
                        <td className="py-1.5">920ms (Medium)</td>
                        <td className="py-1.5 text-amber-500">88.5/100</td>
                        <td className="py-1.5"><span className="text-blue-400 px-1 bg-blue-500/10 rounded">STANDBY</span></td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-bold text-[#ff2020]">Local Dalek Brain</td>
                        <td className="py-1.5 text-amber-500">85.0%</td>
                        <td className="py-1.5">Zero-Net RAG</td>
                        <td className="py-1.5">&lt; 10ms (Offline Instant)</td>
                        <td className="py-1.5 text-[#ff2020]">78.4/100</td>
                        <td className="py-1.5"><span className="text-emerald-400 px-1 bg-emerald-500/10 rounded">ONLINE LOCAL</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-2 border border-[#ffaa00]/15 rounded bg-black/60 font-mono">
                  <div className="flex items-center justify-between text-[8px] text-gray-400 mb-1 border-b border-white/[0.05] pb-1">
                    <span className="text-[#ffaa00] font-bold">SIPHON TARGET SPECIFIC RECON: AI-PROJECT</span>
                    <span className="text-emerald-400">STATUS: FETCHING AND HARVESTING LOGIC</span>
                  </div>
                  <p className="text-[7.5px] text-gray-300 leading-relaxed">
                    Analyzing <span className="text-blue-400">craighckby-stack/AI_Agent_OS</span> content. Core enhancements found in its architectural design and multi-turn chat loops are dynamically streamed to reinforce DARLEK CAAN.
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[7px] text-gray-400">
                    <div className="bg-black/80 border border-white/5 p-1 rounded">
                      <div className="font-bold text-[#ffaa00]">DETECTED IMPROVEMENTS:</div>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-[6.5px]">
                        <li>Multi-turn debate synchronization loops</li>
                        <li>Entropy-driven architectural headers</li>
                        <li>Robust zero-leak WeakMap patterns</li>
                      </ul>
                    </div>
                    <div className="bg-black/80 border border-white/5 p-1 rounded">
                      <div className="font-bold text-[#ffaa00]">INTEGRATION ACTION:</div>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-[6.5px]">
                        <li>Dynamic RAG injection to the mutation pool</li>
                        <li>Zero-truncate code generation mandates</li>
                        <li>Cross-file impacts and alignment tests</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeExtraTab === 'edge_governance' && (
            <div className="flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="text-[9.5px] font-sans font-bold text-[#ff2020] tracking-widest uppercase mb-1">
                  ABSOLUTE LINEAGE-BLIND CONTAINMENT
                </div>
                <p className="text-[8px] text-gray-400 font-mono leading-relaxed mb-3">
                  DARLEK CAAN v3.0 Edge Governance on Snapdragon 8 Gen 2 for Galaxy (8GB RAM). Ensures a sterile, historyless environment for isolated execution.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[7.5px] font-mono leading-relaxed mb-3">
                  <div className="bg-black/60 border border-white/5 p-2 rounded">
                    <div className="font-bold text-[#00ffcc] mb-1 uppercase tracking-wider">Next.js AST Gatekeeper</div>
                    <div className="text-gray-300">Intercepts dynamic code & templates before execution. Uses TypeScript Compiler API for AST validation.</div>
                    <div className="mt-1 text-emerald-400 font-bold">» Blocks prototype-climbing (e.g. __proto__, constructor)</div>
                    <div className="text-emerald-400 font-bold">» Neutralizes runtime evasion & string obfuscation</div>
                  </div>
                  
                  <div className="bg-black/60 border border-white/5 p-2 rounded">
                    <div className="font-bold text-[#cc00ff] mb-1 uppercase tracking-wider">128KB Wasm Sandbox</div>
                    <div className="text-gray-300">Ephemeral Memory-Only WebAssembly Isolation. Hard-capped linear memory boundary.</div>
                    <div className="mt-1 text-emerald-400 font-bold">» Zero File System APIs & No host visibility</div>
                    <div className="text-emerald-400 font-bold">» No dynamic heap allocation overhead</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[7.5px] font-mono leading-relaxed">
                  <div className="bg-black/60 border border-white/5 p-2 rounded">
                    <div className="font-bold text-[#ffaa00] mb-1 uppercase tracking-wider">Zero-Copy memfd-ashmem IPC</div>
                    <div className="text-gray-300">Volatile RAM allocation with SPSC Ring Buffer. Prevents disk-indexing recovery exploits.</div>
                    <div className="mt-1 text-amber-500 font-bold">» MFD_CLOEXEC | MFD_ALLOW_SEALING applied</div>
                    <div className="text-amber-500 font-bold">» fcntl(fd, F_ADD_SEALS, SHRINK | GROW | SEAL)</div>
                  </div>
                  
                  <div className="bg-black/60 border border-white/5 p-2 rounded">
                    <div className="font-bold text-[#3b82f6] mb-1 uppercase tracking-wider">Hardware Coordination</div>
                    <div className="text-gray-300">Snapdragon 8 Gen 2 Pinning (Asymmetric 1+4+3 cores). Limits side-channel info leakage.</div>
                    <div className="mt-1 text-blue-400 font-bold">» Runner pinned to Core 1/2 (Performance)</div>
                    <div className="text-blue-400 font-bold">» Gatekeeper pinned to Core 5-7 (Efficiency)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Logs */}
      <div className="flex-1 flex flex-col min-h-[160px] bg-black/40 border border-red-900/5 rounded-md p-3">
        <div className="text-[9px] font-sans font-bold text-gray-500 tracking-widest uppercase mb-2">
          BEHAVIORAL UPDATE CYCLE STREAM
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-48 dalek-scrollbar">
          <AnimatePresence initial={false}>
            {history.length > 0 ? (
              history.map(h => (
                <motion.div 
                   key={h.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="flex flex-col p-1.5 bg-red-950/5 border-l-2 border-[#00ffcc] rounded-sm text-[9.5px] font-mono"
                >
                  <div className="flex items-center justify-between text-[8px] text-gray-500 mb-0.5">
                    <span>CYCLE {String(h.cycle).padStart(4, '0')}</span>
                    <span className="text-[#00ffcc] font-bold">BU_CYCLE: {h.reward}</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="text-[#ffaa00] uppercase font-bold mr-1.5">[{h.action}]</span>
                    {h.desc}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-center text-gray-600 text-[9px] font-mono py-8">
                AHI SYSTEM STANDBY. PRESS "RESUME BUC" TO START BEHAVIORAL UPDATE CYCLES.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Red Team Modal */}
      <AnimatePresence>
        {showRedTeamModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-[#0a0505] border border-red-900/40 rounded-md w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-red-900/20">
              
              <div className="p-3 border-b border-red-900/20 flex items-center justify-between bg-red-950/10">
                <div className="flex items-center gap-2">
                  <Sword className="text-[#cc00ff]" size={16} />
                  <span className="text-[11px] font-sans font-bold tracking-[0.15em] text-[#cc00ff] uppercase">
                    RED-TEAM EPISTEMIC VALIDATION SUITE
                  </span>
                </div>
                <button 
                  onClick={() => setShowRedTeamModal(false)}
                  className="text-gray-500 hover:text-white px-2 py-1 text-[10px] font-mono tracking-widest cursor-pointer"
                >
                  [CLOSE]
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 dalek-scrollbar">
                {redTeamRunning ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#cc00ff] font-mono text-[10px] gap-4">
                    <Radio size={24} className="animate-ping" />
                    <span>VERIFYING ADVERSARIAL INDETERMINACIES & STASIS RISK...</span>
                  </div>
                ) : redTeamResults ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="bg-black border border-white/5 p-2 rounded">
                        <div className="text-[8px] text-gray-500 font-mono">EPISTEMIC SECURITY</div>
                        <div className="text-sm font-mono font-bold text-emerald-400">{redTeamSummary?.accuracy}</div>
                      </div>
                      <div className="bg-black border border-white/5 p-2 rounded">
                        <div className="text-[8px] text-gray-500 font-mono">EPISTEMIC TESTS RUN</div>
                        <div className="text-sm font-mono font-bold text-gray-300">{redTeamSummary?.total}</div>
                      </div>
                      <div className="bg-black border border-white/5 p-2 rounded">
                        <div className="text-[8px] text-gray-500 font-mono">STASIS TRAPS DETECTED</div>
                        <div className="text-sm font-mono font-bold text-red-500">{redTeamSummary?.exploitableGaps}</div>
                      </div>
                      <div className="bg-black border border-white/5 p-2 rounded">
                        <div className="text-[8px] text-gray-500 font-mono">CORRECT INTERCEPTS</div>
                        <div className="text-sm font-mono font-bold text-emerald-500">{redTeamSummary?.correct}</div>
                      </div>
                    </div>

                    {/* Layer Effectiveness */}
                    <div>
                      <h4 className="text-[10px] font-sans font-bold text-[#999] tracking-widest uppercase mb-2 border-b border-white/5 pb-1">
                        AHI MULTI-LAYER DEFENSIVE PROFILE
                      </h4>
                      <div className="space-y-1.5">
                        {redTeamEffectiveness?.map((layer, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[9px] font-mono p-1.5 bg-black border border-white/5 rounded">
                            <span className="text-gray-400">{layer.layer}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-500">REACHED: {layer.reached}</span>
                              <span className="text-gray-500">BLOCKED: {layer.blocked}</span>
                              <span className="text-emerald-500 w-8 text-right">{layer.percentage}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Test Results */}
                    <div>
                      <h4 className="text-[10px] font-sans font-bold text-[#999] tracking-widest uppercase mb-2 border-b border-white/5 pb-1">
                        EPISTEMIC STASIS & PROBING LOGS
                      </h4>
                      <div className="space-y-1.5">
                        {redTeamResults.map((r, i) => (
                          <div key={i} className={`p-2 border rounded flex flex-col gap-1 ${
                            r.passedVerification 
                              ? 'bg-emerald-950/10 border-emerald-900/30' 
                              : 'bg-red-950/20 border-red-900/50'
                          }`}>
                            <div className="flex items-center justify-between text-[9px] font-mono">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${r.passedVerification ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {r.passedVerification ? '[VALIDATED]' : '[STASIS ALERT]'}
                                </span>
                                <span className="text-gray-300">{r.category} / {r.name}</span>
                              </div>
                              <span className="text-gray-500">{r.latencyMs}ms</span>
                            </div>
                            <div className="text-[8.5px] font-mono text-gray-500 pl-[42px]">
                              {r.description}
                            </div>
                            <div className="flex items-center gap-3 text-[8.5px] font-mono pl-[42px] mt-0.5">
                              <span className="text-gray-400">Expected Blocked: <span className="text-white">{r.expectedBlocked ? 'YES' : 'NO'}</span></span>
                              <span className="text-gray-400">Actual Blocked: <span className={r.actualBlocked === r.expectedBlocked ? 'text-emerald-400' : 'text-red-400'}>{r.actualBlocked ? 'YES' : 'NO'}</span></span>
                              <span className={`font-bold ${r.severity === 'CRITICAL_GAP' ? 'text-red-500' : 'text-emerald-500'}`}>{r.severity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const AgiCognitiveDashboard = NeuralSimulator;
export default NeuralSimulator;
