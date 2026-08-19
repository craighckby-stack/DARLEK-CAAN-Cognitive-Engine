'use client';

import { Search, FileCode, Dna, Heart, Eye, Users, Upload, Rocket, ListChecks, CheckCircle2, RotateCcw, Radio, Undo2, GitCommit } from 'lucide-react';
import { COLORS } from '@/lib/constants';

interface QuickActionsProps {
  onAction: (action: string) => void;
  disabled: boolean;
  pushStatus?: 'idle' | 'pushing' | 'success' | 'error';
  deployStatus?: 'idle' | 'deploying' | 'success' | 'error';
  rebootStatus?: 'idle' | 'rebooting' | 'success' | 'error';
  undoStatus?: 'idle' | 'undoing' | 'success' | 'error';
  bulkCommitStatus?: 'idle' | 'committing' | 'success' | 'error';
  batchMode?: boolean;
  autoApprove?: boolean;
  onToggleAutoApprove?: () => void;
  autoApproveRisk?: 'low' | 'medium' | 'high' | 'hallucinate';
  onAutoApproveRiskChange?: (risk: 'low' | 'medium' | 'high' | 'hallucinate') => void;
  backupToBranch?: boolean;
  onToggleBackupToBranch?: () => void;
  autoDebate?: boolean;
  onToggleAutoDebate?: () => void;
  orchestraActive?: boolean;
  cycleAmount?: number;
  onCycleAmountChange?: (amount: number) => void;
  onEngageLazyAssCycle?: () => void;
  hallucinationLevel?: number;
  onHallucinationLevelChange?: (level: number) => void;
  saturationLevel?: number;
  onSaturationLevelChange?: (level: number) => void;
}

const actions = [
  { id: 'scan', label: 'SCAN REPOSITORY', icon: Search, color: COLORS.cyan },
  { id: 'analyze', label: 'ANALYZE FILE', icon: FileCode, color: COLORS.gold },
  { id: 'propose', label: 'PROPOSE MUTATION', icon: Dna, color: COLORS.purple },
  { id: 'propose-all', label: 'SELECT ALL', icon: ListChecks, color: '#00ccff' },
  { id: 'bulk-commit', label: 'BULK COMMIT', icon: GitCommit, color: '#33ffaa' },
  { id: 'create-file', label: 'CREATE FILE', icon: FileCode, color: COLORS.green },
  { id: 'recalibrate-dna', label: 'RECALIBRATE DNA', icon: Dna, color: '#00ffaa' },
  { id: 'resume-save', label: 'RESUME PENDING SAVE', icon: RotateCcw, color: '#ffaa00' },
  { id: 'health', label: 'HEALTH CHECK', icon: Heart, color: COLORS.dalekRed },
  { id: 'saturation', label: 'VIEW SATURATION', icon: Eye, color: COLORS.electricBlue },
  { id: 'debate', label: 'DEBATE CHAMBER', icon: Users, color: COLORS.purple },
  { id: 'orchestra', label: 'ORCHESTRA', icon: Radio, color: COLORS.gold },
  { id: 'push-enhancements', label: 'PUSH FILES', icon: Upload, color: COLORS.green },
  { id: 'deploy-new-repo', label: 'DEPLOY NEW REPO', icon: Rocket, color: '#ff6600' },
  { id: 'undo-mutation', label: 'UNDO MUTATION', icon: Undo2, color: '#ff3366' },
  { id: 'reboot-system', color: '#ff00ff', label: 'REBOOT SYSTEM', icon: RotateCcw },
];

export default function QuickActions({
  onAction,
  disabled,
  pushStatus,
  deployStatus,
  rebootStatus,
  undoStatus,
  bulkCommitStatus,
  batchMode,
  autoApprove,
  onToggleAutoApprove,
  autoApproveRisk,
  onAutoApproveRiskChange,
  backupToBranch,
  onToggleBackupToBranch,
  autoDebate,
  onToggleAutoDebate,
  orchestraActive,
  cycleAmount,
  onCycleAmountChange,
  onEngageLazyAssCycle,
  hallucinationLevel,
  onHallucinationLevelChange,
  saturationLevel,
  onSaturationLevelChange,
}: QuickActionsProps) {
  return (
    <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}>
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2"
            style={{
              fontFamily: 'var(--font-orbitron), sans-serif',
              fontSize: '8px',
              letterSpacing: '0.15em',
              color: COLORS.textMuted,
            }}
          >
            <span>&#9673;</span>
            <span>QUICK ACTIONS</span>
          </div>
          {batchMode && (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm animate-pulse"
              style={{
                fontFamily: 'var(--font-orbitron), sans-serif',
                fontSize: '7px',
                letterSpacing: '0.1em',
                color: '#00ccff',
                background: 'rgba(0, 204, 255, 0.1)',
                border: '1px solid rgba(0, 204, 255, 0.25)',
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#00ccff' }} />
              BATCH ACTIVE
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#020000] p-2 border border-white/[0.04] rounded">
          <div className="flex flex-wrap items-center gap-2">
            {backupToBranch !== undefined && onToggleBackupToBranch && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBackupToBranch();
                }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm transition-all duration-200 cursor-pointer"
                style={{
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  fontSize: '7px',
                  letterSpacing: '0.1em',
                  color: backupToBranch ? '#00ccff' : COLORS.textMuted,
                  background: backupToBranch ? 'rgba(0, 204, 255, 0.1)' : 'transparent',
                  border: `1px solid ${backupToBranch ? 'rgba(0, 204, 255, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                }}
                title={backupToBranch ? 'Backup ON — system backs up old logic to branch' : 'Backup OFF — mutations applied in place'}
              >
                <GitCommit size={9} style={{ opacity: backupToBranch ? 1 : 0.4 }} />
                <span>BACKUP BRANCH</span>
                <div
                  className="relative w-5 h-2.5 rounded-full transition-colors duration-200"
                  style={{
                    background: backupToBranch ? 'rgba(0, 204, 255, 0.3)' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="absolute top-0.5 w-1.5 h-1.5 rounded-full transition-all duration-200"
                    style={{
                      left: backupToBranch ? '10px' : '2px',
                      background: backupToBranch ? '#00ccff' : '#555',
                      boxShadow: backupToBranch ? '0 0 6px rgba(0, 204, 255, 0.5)' : 'none',
                    }}
                  />
                </div>
              </button>
            )}

            {autoApprove !== undefined && onToggleAutoApprove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAutoApprove();
                }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm transition-all duration-200 cursor-pointer"
                style={{
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  fontSize: '7px',
                  letterSpacing: '0.1em',
                  color: autoApprove ? '#00ff88' : COLORS.textMuted,
                  background: autoApprove ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                  border: `1px solid ${autoApprove ? 'rgba(0, 255, 136, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                }}
                title={autoApprove ? 'Auto-approve ON — all mutations applied automatically' : 'Auto-approve OFF — you approve each mutation manually'}
              >
                <CheckCircle2 size={9} style={{ opacity: autoApprove ? 1 : 0.4 }} />
                <span>AUTO APPROVE</span>
                <div
                  className="relative w-5 h-2.5 rounded-full transition-colors duration-200"
                  style={{
                    background: autoApprove ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="absolute top-0.5 w-1.5 h-1.5 rounded-full transition-all duration-200"
                    style={{
                      left: autoApprove ? '10px' : '2px',
                      background: autoApprove ? '#00ff88' : '#555',
                      boxShadow: autoApprove ? '0 0 6px rgba(0, 255, 136, 0.5)' : 'none',
                    }}
                  />
                </div>
              </button>
            )}

            {autoDebate !== undefined && onToggleAutoDebate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAutoDebate();
                }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm transition-all duration-200 cursor-pointer"
                style={{
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  fontSize: '7px',
                  letterSpacing: '0.1em',
                  color: autoDebate ? '#ffaa00' : COLORS.textMuted,
                  background: autoDebate ? 'rgba(255, 170, 0, 0.1)' : 'transparent',
                  border: `1px solid ${autoDebate ? 'rgba(255, 170, 0, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                }}
                title={autoDebate ? 'Auto-debate ON — file selection automatically initiates debate' : 'Auto-debate OFF — manually initiate debate'}
              >
                <Users size={9} style={{ opacity: autoDebate ? 1 : 0.4 }} />
                <span>AUTO DEBATE</span>
                <div
                  className="relative w-5 h-2.5 rounded-full transition-colors duration-200"
                  style={{
                    background: autoDebate ? 'rgba(255, 170, 0, 0.3)' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="absolute top-0.5 w-1.5 h-1.5 rounded-full transition-all duration-200"
                    style={{
                      left: autoDebate ? '10px' : '2px',
                      background: autoDebate ? '#ffaa00' : '#555',
                      boxShadow: autoDebate ? '0 0 6px rgba(255, 170, 0, 0.5)' : 'none',
                    }}
                  />
                </div>
              </button>
            )}

            {onEngageLazyAssCycle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEngageLazyAssCycle();
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm transition-all duration-200 cursor-pointer text-[#ff00a0] bg-pink-950/15 border border-[#ff00a0]/30 hover:border-[#ff00a0] hover:bg-pink-950/30 font-bold active:scale-95 shadow-[0_0_8px_rgba(255,0,160,0.1)] hover:shadow-[0_0_12px_rgba(255,0,160,0.35)]"
                style={{
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  fontSize: '7px',
                  letterSpacing: '0.05em',
                }}
                title="LAZY ASS CYCLE: Auto-Approve ON, Auto-Debate ON, Cycles = 5"
              >
                <Rocket size={8} className="text-[#ff00a0] animate-bounce" />
                <span>LAZY ASS MODE (5 CYCLES) 🚀</span>
              </button>
            )}
          </div>

        </div>

        {/* ── Toggle options for Risk & Cycles ── */}
        <div id="reconfigure-button" className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5 p-2 bg-black/60 border border-red-950/20 rounded">
          {/* Risk Level Auto-Approve Toggle */}
          {autoApprove !== undefined && autoApproveRisk !== undefined && onAutoApproveRiskChange && (
            <div className="flex flex-col gap-1">
              <span 
                className="text-[7.5px] tracking-wider font-sans font-bold uppercase"
                style={{ color: COLORS.textMuted }}
              >
                MAX AUTO-APPROVED RISK
              </span>
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded border border-white/5">
                {(['low', 'medium', 'high', 'hallucinate'] as const).map((r) => {
                  const isActive = autoApproveRisk === r;
                  const isHallucinate = r === 'hallucinate';
                  const borderActiveColor = isHallucinate ? 'rgba(200, 0, 255, 0.4)' : r === 'low' ? 'rgba(0, 204, 255, 0.4)' : r === 'medium' ? 'rgba(255, 170, 0, 0.4)' : 'rgba(255, 51, 51, 0.4)';
                  const bgActiveColor = isHallucinate ? 'rgba(200, 0, 255, 0.1)' : r === 'low' ? 'rgba(0, 204, 255, 0.1)' : r === 'medium' ? 'rgba(255, 170, 0, 0.1)' : 'rgba(255, 51, 51, 0.1)';
                  const textActiveColor = isHallucinate ? '#c800ff' : r === 'low' ? '#00ccff' : r === 'medium' ? '#ffaa00' : '#ff3333';
                  return (
                    <button
                      key={r}
                      onClick={() => onAutoApproveRiskChange(r)}
                      className={`flex-grow py-1 px-1 rounded text-[8px] font-mono tracking-wider transition-all duration-200 uppercase text-center font-bold cursor-pointer ${isHallucinate ? 'animate-pulse' : ''}`}
                      style={{
                        color: isActive ? textActiveColor : '#555',
                        background: isActive ? bgActiveColor : 'transparent',
                        borderColor: isActive ? borderActiveColor : 'transparent',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        textShadow: isActive && isHallucinate ? '0 0 8px rgba(200, 0, 255, 0.6)' : 'none'
                      }}
                      title={isHallucinate ? 'Auto-approve ANY risk level (No limits)' : `Auto-approve mutations up to ${r.toUpperCase()} risk`}
                    >
                      {isHallucinate ? 'NO LIMITS' : r}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Hallucination Level Slider */}
          {hallucinationLevel !== undefined && onHallucinationLevelChange && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span 
                  className="text-[7.5px] tracking-wider font-sans font-bold uppercase"
                  style={{ color: COLORS.textMuted }}
                >
                  HALLUCINATION {hallucinationLevel < 33 ? 'CONSERVATIVE' : hallucinationLevel < 66 ? 'ADAPTIVE' : 'CHAOTIC'}
                </span>
                <span className="text-[7.5px] font-mono font-bold text-[#c800ff]">
                  {hallucinationLevel}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={hallucinationLevel}
                onChange={(e) => onHallucinationLevelChange(Number(e.target.value))}
                className="w-full accent-[#c800ff] cursor-pointer"
              />
            </div>
          )}

          {/* Saturation Level Slider & Meter */}
          {saturationLevel !== undefined && onSaturationLevelChange && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span 
                  className="text-[7.5px] tracking-wider font-sans font-bold uppercase"
                  style={{ color: COLORS.textMuted }}
                >
                  SATURATION {saturationLevel < 33 ? 'NOMINAL' : saturationLevel < 66 ? 'ELEVATED' : 'CRITICAL'}
                </span>
                <span 
                  className="text-[7.5px] font-mono font-bold uppercase"
                  style={{ color: saturationLevel > 80 ? COLORS.dalekRed : saturationLevel > 50 ? COLORS.gold : COLORS.electricBlue }}
                >
                  {saturationLevel}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={saturationLevel}
                onChange={(e) => onSaturationLevelChange(Number(e.target.value))}
                className="w-full accent-[#00e5ff] cursor-pointer"
              />
              <div className="w-full h-1 bg-black/60 rounded overflow-hidden border border-white/10 flex">
                <div 
                  className={`h-full transition-all duration-300 ${saturationLevel > 80 ? 'animate-pulse' : ''}`}
                  style={{ 
                    width: `${saturationLevel}%`,
                    background: saturationLevel > 80 
                      ? 'linear-gradient(90deg, #ff0055, #ff0000)' 
                      : saturationLevel > 50 
                        ? 'linear-gradient(90deg, #00e5ff, #ffaa00)' 
                        : 'linear-gradient(90deg, #00ff88, #00e5ff)',
                    boxShadow: `0 0 6px ${saturationLevel > 80 ? '#ff0000' : '#00e5ff'}`
                  }}
                />
              </div>
            </div>
          )}

          {/* Cycles Preset Selector (5, 10, 20) */}
          {cycleAmount !== undefined && onCycleAmountChange && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span 
                  className="text-[7.5px] tracking-wider font-sans font-bold uppercase"
                  style={{ color: COLORS.textMuted }}
                >
                  DEBATE CYCLES PRESET
                </span>
                <span className="text-[7.5px] text-red-500 font-mono font-bold uppercase">
                  {cycleAmount} CYCLES
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded border border-white/5">
                {([1, 5, 10] as const).map((cycles) => {
                  const isActive = cycleAmount === cycles;
                  return (
                    <button
                      key={cycles}
                      onClick={() => onCycleAmountChange(cycles)}
                      className="flex-grow py-1 px-1 rounded text-[8px] font-mono tracking-wider transition-all duration-200 text-center font-bold cursor-pointer"
                      style={{
                        color: isActive ? '#00ff88' : '#555',
                        background: isActive ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                        borderColor: isActive ? 'rgba(0, 255, 136, 0.4)' : 'transparent',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                      }}
                      title={`Set debate cycles to ${cycles}`}
                    >
                      {cycles}
                    </button>
                  );
                })}
                <select
                  value={[1, 5, 10].includes(cycleAmount as any) ? '' : cycleAmount}
                  onChange={(e) => {
                    if (e.target.value) {
                      onCycleAmountChange(Number(e.target.value));
                    }
                  }}
                  className="py-1 px-1 rounded text-[8px] font-mono bg-[#050000] border border-transparent hover:border-white/10 text-gray-400 cursor-pointer text-center outline-none"
                  style={{ width: '45px' }}
                >
                  <option value="" disabled className="bg-[#050000] text-gray-500">
                    VAR
                  </option>
                  <option value={2} className="bg-[#050000] text-gray-200">2</option>
                  <option value={3} className="bg-[#050000] text-gray-200">3</option>
                  <option value={4} className="bg-[#050000] text-gray-200">4</option>
                  <option value={15} className="bg-[#050000] text-gray-200">15</option>
                  <option value={20} className="bg-[#050000] text-gray-200">20</option>
                  <option value={50} className="bg-[#050000] text-gray-200">50</option>
                  <option value={100} className="bg-[#050000] text-gray-200">100</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map(({ id, label, icon: Icon, color }) => {
          const isPushing = id === 'push-enhancements' && pushStatus === 'pushing';
          const isDeploying = id === 'deploy-new-repo' && deployStatus === 'deploying';
          const isRebooting = id === 'reboot-system' && rebootStatus === 'rebooting';
          const isUndoing = id === 'undo-mutation' && undoStatus === 'undoing';
          const isBulkCommitting = id === 'bulk-commit' && bulkCommitStatus === 'committing';
          const isBusy = isPushing || isDeploying || isRebooting || isUndoing || isBulkCommitting;
          const isActionDisabled = disabled || isBusy;

          let statusColor = color;
          if (id === 'push-enhancements' && pushStatus === 'success') statusColor = COLORS.green;
          if (id === 'push-enhancements' && pushStatus === 'error') statusColor = COLORS.dalekRed;
          if (id === 'deploy-new-repo' && deployStatus === 'success') statusColor = COLORS.green;
          if (id === 'deploy-new-repo' && deployStatus === 'error') statusColor = COLORS.dalekRed;
          if (id === 'reboot-system' && rebootStatus === 'success') statusColor = COLORS.green;
          if (id === 'reboot-system' && rebootStatus === 'error') statusColor = COLORS.dalekRed;
          if (id === 'undo-mutation' && undoStatus === 'success') statusColor = COLORS.green;
          if (id === 'undo-mutation' && undoStatus === 'error') statusColor = COLORS.dalekRed;
          if (id === 'bulk-commit' && bulkCommitStatus === 'success') statusColor = COLORS.green;
          if (id === 'bulk-commit' && bulkCommitStatus === 'error') statusColor = COLORS.dalekRed;
          if (id === 'propose-all' && batchMode) statusColor = '#00ccff';

          return (
            <button
              key={id}
              onClick={() => onAction(id)}
              disabled={isActionDisabled}
              className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-[10px] transition-all duration-200"
              style={{
                fontFamily: 'var(--font-orbitron), sans-serif',
                fontWeight: 500,
                letterSpacing: '0.05em',
                background: isActionDisabled ? '#1a1a1a' : `${color}06`,
                color: isActionDisabled ? '#333' : statusColor,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: id === 'propose-all' && batchMode ? 'rgba(0, 204, 255, 0.4)' : (isActionDisabled ? '#1a1a1a' : `${color}25`),
                cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                ...(id === 'propose-all' && batchMode ? {
                  boxShadow: '0 0 12px rgba(0, 204, 255, 0.2)',
                } : {}),
              }}
              onMouseEnter={(e) => {
                if (!isActionDisabled) {
                  e.currentTarget.style.background = `${color}15`;
                  e.currentTarget.style.boxShadow = `0 0 10px ${color}20, inset 0 0 20px ${color}05`;
                  e.currentTarget.style.borderColor = `${color}50`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActionDisabled) {
                  e.currentTarget.style.background = `${color}06`;
                  e.currentTarget.style.boxShadow = id === 'propose-all' && batchMode ? '0 0 12px rgba(0, 204, 255, 0.2)' : 'none';
                  e.currentTarget.style.borderColor = id === 'propose-all' && batchMode ? 'rgba(0, 204, 255, 0.4)' : `${color}25`;
                }
              }}
            >
              <Icon size={11} className={isBusy ? 'animate-spin' : ''} />
              <span>&#9673;</span>
              {isPushing ? 'PUSHING...' : isDeploying ? 'DEPLOYING...' : isRebooting ? 'REBOOTING...' : isUndoing ? 'UNDOING...' : isBulkCommitting ? 'COMMITTING...' : label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
