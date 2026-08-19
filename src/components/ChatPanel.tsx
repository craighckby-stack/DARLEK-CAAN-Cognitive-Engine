'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, GitBranch, RefreshCw, Paperclip, File, X } from 'lucide-react';
import type { Message, SystemState, BranchInfo } from '@/lib/types';
import { SETUP_STEPS, COLORS } from '@/lib/constants';
import ChatMessage from './ChatMessage';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string, fileAttachment?: { name: string; content: string }) => void;
  isLoading: boolean;
  systemState: SystemState;
  onTestConnection: (provider: string, key: string) => void;
  onUpdateKey: (key: string, value: string) => void;
  onUpdateRepoConfig: (field: 'owner' | 'repo' | 'branch', value: string) => void;
  branches: BranchInfo[];
  branchesLoading: boolean;
  onFetchBranches: () => void;
}

export default function ChatPanel({
  messages,
  onSendMessage,
  isLoading,
  systemState,
  onTestConnection,
  onUpdateKey,
  onUpdateRepoConfig,
  branches,
  branchesLoading,
  onFetchBranches,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });
      
      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        data = await res.json();
      }
      
      if (data && data.success && data.text) {
        setAttachedFile({
          name: file.name,
          content: data.text,
        });
      } else {
        // Fallback to text reader
        const reader = new FileReader();
        reader.onload = (event) => {
          setAttachedFile({
            name: file.name,
            content: (event.target?.result as string) || '',
          });
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error('File extraction failed:', err);
      // Fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          content: (event.target?.result as string) || '',
        });
      };
      reader.readAsText(file);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSend = useCallback(() => {
    if ((input.trim() || attachedFile) && !isLoading) {
      onSendMessage(input.trim(), attachedFile || undefined);
      setInput('');
      setAttachedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [input, attachedFile, isLoading, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentStep = systemState?.currentStep || 0;
  const setupStep = currentStep < SETUP_STEPS.length ? SETUP_STEPS[currentStep] : null;

  const getStatusText = (status: string): string => {
    if (status === 'testing') return 'TESTING...';
    if (status === 'connected') return 'ONLINE';
    if (status === 'error') return 'FAILED';
    return 'IDLE';
  };

  const handleBranchSelect = (branchName: string) => {
    onUpdateRepoConfig('branch', branchName);
    onSendMessage(`branch: ${branchName}`);
  };

  const renderSetupInput = () => {
    if (!setupStep || systemState.setupComplete) return null;

    const stepId = setupStep.id;

    if (stepId === 'repo') {
      return (
        <div className="space-y-3 p-4 flex-shrink-0" style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}>
          <input
            type="text"
            placeholder={setupStep.placeholder}
            defaultValue="craighckby-stack/AI_Agent_OS"
            className="dalek-input w-full px-4 py-3 text-sm"
            onChange={(e) => {
              const val = e.target.value;
              const parts = val.split('/');
              onUpdateRepoConfig('owner', parts[0] || '');
              onUpdateRepoConfig('repo', parts.slice(1).join('/') || '');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && systemState.repoConfig.owner && systemState.repoConfig.repo) {
                onSendMessage(`repo: ${systemState.repoConfig.owner}/${systemState.repoConfig.repo}`);
              }
            }}
          />
          <button
            onClick={() => {
              if (systemState.repoConfig.owner && systemState.repoConfig.repo) {
                onSendMessage(`repo: ${systemState.repoConfig.owner}/${systemState.repoConfig.repo}`);
              }
            }}
            disabled={!systemState.repoConfig.owner || !systemState.repoConfig.repo}
            className="dalek-btn dalek-btn-primary px-6 py-2 text-xs w-full"
          >
            SET TARGET REPOSITORY
          </button>
        </div>
      );
    }

    if (stepId === 'branch') {
      return (
        <div className="space-y-3 p-4 flex-shrink-0" style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch size={14} style={{ color: COLORS.gold }} />
              <span
                style={{
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  color: COLORS.gold,
                }}
              >
                SELECT BRANCH
              </span>
            </div>
            <button
              onClick={onFetchBranches}
              disabled={branchesLoading}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all"
              style={{
                color: COLORS.cyan,
                background: 'rgba(0, 255, 204, 0.05)',
                border: '1px solid rgba(0, 255, 204, 0.15)',
                cursor: branchesLoading ? 'not-allowed' : 'pointer',
                opacity: branchesLoading ? 0.5 : 1,
              }}
              title="Refresh branch list"
            >
              <RefreshCw size={11} className={branchesLoading ? 'animate-spin' : ''} />
              REFRESH
            </button>
          </div>

          {branchesLoading ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={14} className="animate-spin" style={{ color: COLORS.dalekRed }} />
              <span style={{ color: COLORS.textMuted, fontSize: '11px', fontFamily: 'var(--font-share-tech-mono), monospace' }}>
                Scanning branches...
              </span>
            </div>
          ) : branches.length > 0 ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto dalek-scrollbar pr-1">
              {branches.map((branch) => (
                <button
                  key={branch.name}
                  onClick={() => handleBranchSelect(branch.name)}
                  className="w-full text-left px-3 py-2.5 rounded flex items-center justify-between group transition-all"
                  style={{
                    background: systemState.repoConfig.branch === branch.name
                      ? 'rgba(185, 28, 28, 0.15)'
                      : 'rgba(20, 10, 10, 0.6)',
                    border: `1px solid ${systemState.repoConfig.branch === branch.name ? 'rgba(185, 28, 28, 0.4)' : 'rgba(185, 28, 28, 0.1)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <GitBranch
                      size={12}
                      style={{
                        color: branch.default ? COLORS.gold : systemState.repoConfig.branch === branch.name ? COLORS.dalekRed : COLORS.textMuted,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-share-tech-mono), monospace',
                        fontSize: '12px',
                        color: '#ffffff',
                      }}
                    >
                      {branch.name}
                    </span>
                  </div>
                  {branch.default && (
                    <span
                      style={{
                        fontFamily: 'var(--font-orbitron), sans-serif',
                        fontSize: '8px',
                        letterSpacing: '0.08em',
                        color: COLORS.gold,
                        background: 'rgba(212, 160, 23, 0.1)',
                        border: '1px solid rgba(212, 160, 23, 0.2)',
                        padding: '1px 6px',
                        borderRadius: '2px',
                      }}
                    >
                      DEFAULT
                    </span>
                  )}
                  {systemState.repoConfig.branch === branch.name && !branch.default && (
                    <span
                      style={{
                        fontFamily: 'var(--font-orbitron), sans-serif',
                        fontSize: '8px',
                        letterSpacing: '0.08em',
                        color: COLORS.dalekRed,
                        background: 'rgba(185, 28, 28, 0.1)',
                        border: '1px solid rgba(185, 28, 28, 0.2)',
                        padding: '1px 6px',
                        borderRadius: '2px',
                      }}
                    >
                      SELECTED
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-3">
              <span style={{ color: COLORS.textMuted, fontSize: '11px', fontFamily: 'var(--font-share-tech-mono), monospace' }}>
                No branches found. Check repository access.
              </span>
            </div>
          )}

          <div
            className="pt-2"
            style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}
          >
            <span style={{ color: COLORS.textMuted, fontSize: '9px', fontFamily: 'var(--font-orbitron), sans-serif', letterSpacing: '0.1em' }}>
              OR ENTER CUSTOM BRANCH:
            </span>
            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="text"
                placeholder="branch name..."
                defaultValue="main"
                className="dalek-input flex-1 px-3 py-2 text-xs"
                onChange={(e) => onUpdateRepoConfig('branch', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSendMessage(`branch: ${e.currentTarget.value || 'main'}`);
                  }
                }}
              />
              <button
                onClick={() => onSendMessage(`branch: ${systemState?.repoConfig?.branch || 'main'}`)}
                className="dalek-btn dalek-btn-primary px-3 py-2 text-xs"
              >
                SET
              </button>
            </div>
          </div>
        </div>
      );
    }

    // GitHub token step
    if (stepId === 'github') {
      const currentValue = systemState.apiKeys.github;
      const status = systemState.connectionStatus.github;

      return (
        <div className="space-y-3 p-4 flex-shrink-0" style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}>
          <div
            className="px-3 py-2 rounded text-xs mb-2"
            style={{
              color: COLORS.cyan,
              background: 'rgba(0, 255, 204, 0.03)',
              border: '1px solid rgba(0, 255, 204, 0.1)',
            }}
          >
            Dalek Brain Engine: ONLINE (built-in) | No external APIs
          </div>
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder={setupStep.placeholder}
              className="dalek-input flex-1 px-4 py-3 text-sm"
              value={currentValue}
              onChange={(e) => onUpdateKey('github', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && currentValue.trim()) {
                  onTestConnection('github', currentValue);
                }
              }}
            />
            <button
              onClick={() => onTestConnection('github', currentValue)}
              disabled={!currentValue.trim() || status === 'testing'}
              className="dalek-btn dalek-btn-primary px-4 py-3 text-xs whitespace-nowrap"
            >
              {status === 'testing' ? (
                <span className="flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" />
                  TESTING
                </span>
              ) : (
                <span>CONNECT</span>
              )}
            </button>
          </div>
          {status !== 'idle' && (
            <div
              className="px-3 py-2 rounded text-xs"
              style={{
                color: status === 'connected' ? COLORS.cyan : COLORS.dalekRed,
                background: status === 'connected' ? 'rgba(0, 255, 204, 0.05)' : 'rgba(255, 32, 32, 0.05)',
                border: `1px solid ${status === 'connected' ? 'rgba(0, 255, 204, 0.1)' : 'rgba(255, 32, 32, 0.1)'}`,
              }}
            >
              {getStatusText(status)} — GitHub {status === 'connected' ? 'connected.' : 'connection failed. Try again.'}
            </div>
          )}
          {status === 'connected' && (
            <button
              onClick={() => onSendMessage('github: configured')}
              className="dalek-btn dalek-btn-secondary px-4 py-2 text-xs w-full"
            >
              CONTINUE
            </button>
          )}
        </div>
      );
    }

    // Gemini API key step
    if (stepId === 'llm-keys') {
      const geminiStatus = systemState.connectionStatus.gemini;
      const geminiKey = systemState.apiKeys.gemini || '';
      const isGeoblocked = (systemState as unknown as Record<string, unknown>).geminiGeoblocked === true;

      return (
        <div className="space-y-3 p-4 flex-shrink-0" style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}>
          <div
            className="px-3 py-2 rounded text-xs mb-2"
            style={{
              color: geminiStatus === 'connected' ? COLORS.green : COLORS.gold,
              background: geminiStatus === 'connected' ? 'rgba(0, 255, 136, 0.05)' : 'rgba(212, 160, 23, 0.05)',
              border: `1px solid ${geminiStatus === 'connected' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(212, 160, 23, 0.1)'}`,
            }}
          >
            {geminiStatus === 'connected'
              ? 'Gemini connected — external LLM augmentation active.'
              : isGeoblocked
                ? 'Gemini geoblocked. Dalek Brain active.'
                : geminiKey
                  ? 'Gemini key detected. Test to verify connection.'
                  : 'Dalek Brain engine is ACTIVE. Gemini is optional external augmentation.'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  color: '#4285f4',
                }}
              >
                GEMINI API KEY (OPTIONAL)
              </span>
              {geminiStatus === 'connected' && (
                <span
                  style={{
                    fontSize: '8px',
                    color: COLORS.green,
                    fontFamily: 'var(--font-share-tech-mono), monospace',
                  }}
                >
                  ONLINE
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="AIza... (or leave blank for Dalek Brain)"
                className="dalek-input flex-1 px-3 py-2 text-xs"
                value={geminiKey}
                onChange={(e) => onUpdateKey('gemini', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.currentTarget.value.trim()) {
                      onTestConnection('gemini', e.currentTarget.value);
                    } else {
                      onSendMessage('skip');
                    }
                  }
                }}
                style={{
                  borderColor: geminiStatus === 'connected'
                    ? `${COLORS.green}30`
                    : geminiStatus === 'error'
                      ? `${COLORS.dalekRed}30`
                      : undefined,
                }}
              />
              <button
                onClick={() => geminiKey.trim() ? onTestConnection('gemini', geminiKey) : onSendMessage('skip')}
                disabled={geminiStatus === 'testing'}
                className="px-3 py-2 text-xs transition-all whitespace-nowrap"
                style={{
                  color: '#4285f4',
                  background: 'rgba(66, 133, 244, 0.08)',
                  border: '1px solid rgba(66, 133, 244, 0.25)',
                  cursor: geminiStatus !== 'testing' ? 'pointer' : 'not-allowed',
                  opacity: geminiStatus !== 'testing' ? 1 : 0.4,
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  fontSize: '8px',
                  letterSpacing: '0.08em',
                }}
              >
                {geminiStatus === 'testing' ? (
                  <span className="flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" />
                    TEST
                  </span>
                ) : geminiStatus === 'connected' ? (
                  'RE-TEST'
                ) : (
                  'TEST'
                )}
              </button>
            </div>
            {geminiStatus === 'error' && !isGeoblocked && (
              <div
                className="px-2 py-1 rounded text-xs"
                style={{
                  color: COLORS.dalekRed,
                  fontSize: '9px',
                }}
              >
                Connection failed. Check your key.
              </div>
            )}
            {isGeoblocked && geminiStatus === 'error' && (
              <div
                className="px-2 py-1 rounded text-xs"
                style={{
                  color: COLORS.gold,
                  fontSize: '9px',
                }}
              >
                Region blocked. Dalek Brain active.
              </div>
            )}
          </div>

          <button
            onClick={() => onSendMessage('skip')}
            className="dalek-btn dalek-btn-secondary px-6 py-2 text-xs w-full mt-2"
          >
            CONTINUE WITH DALEK BRAIN
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: `linear-gradient(180deg, rgba(5,0,0,0.98) 0%, rgba(0,0,0,0.98) 100%)`,
      }}
    >
      {/* Chat header */}
      <div
        className="px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{
          borderBottom: `1px solid rgba(255, 32, 32, 0.15)`,
          background: 'linear-gradient(180deg, rgba(17, 0, 0, 0.6) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full dalek-eye-stalk flex-shrink-0"
            style={{ background: COLORS.dalekRed }}
          />
          <span
            style={{
              fontFamily: 'var(--font-orbitron), sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: COLORS.dalekRed,
            }}
          >
            COMMUNICATION CHANNEL
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-orbitron), sans-serif',
            fontSize: '10px',
            color: COLORS.textMuted,
          }}
        >
          {messages.length} MSGS
        </span>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto dalek-scrollbar p-4 space-y-3 min-h-0">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="message-animate flex justify-start">
            <div className="chat-caan rounded-lg p-3 mr-12">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 pulse-red"
                  style={{ background: COLORS.dalekRed }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-orbitron), sans-serif',
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: COLORS.dalekRed,
                  }}
                >
                  DARLEK CANN
                </span>
              </div>
              <div className="flex items-center gap-1.5 py-1">
                <div className="typing-dot w-2 h-2 rounded-full" style={{ background: COLORS.dalekRed }} />
                <div className="typing-dot w-2 h-2 rounded-full" style={{ background: COLORS.dalekRed }} />
                <div className="typing-dot w-2 h-2 rounded-full" style={{ background: COLORS.dalekRed }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Setup input area */}
      {!systemState.setupComplete && renderSetupInput()}

      {/* Free text input (after setup) */}
      {systemState.setupComplete && (
        <div className="p-3 flex-shrink-0" style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}>
          {attachedFile && (
            <div className="mb-2 px-3 py-2 bg-[#120808] border border-[#a21f1f]/30 rounded flex items-center justify-between text-xs font-mono text-stone-300">
              <div className="flex items-center gap-1.5 truncate">
                <File size={13} style={{ color: COLORS.dalekRed }} />
                <span className="truncate">{attachedFile.name}</span>
              </div>
              <button 
                onClick={() => {
                  setAttachedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-gray-400 hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept=".txt,.json,.md,.html,.xml,.yml,.yaml,.ts,.tsx,.js,.jsx,.pdf,.doc,.docx" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isExtracting}
              title="Attach Blueprint Document"
              className="dalek-btn p-3 flex-shrink-0 flex items-center justify-center hover:bg-stone-900 transition-colors"
              style={{ 
                minHeight: '42px', 
                minWidth: '42px',
                border: `1px solid ${COLORS.panelBorder}`,
                color: attachedFile ? COLORS.dalekRed : COLORS.textMuted
              }}
            >
              {isExtracting ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachedFile ? "Description of specification system... Type 'create' with this to compile!" : "Type a command..."}
              rows={1}
              className="dalek-input flex-1 px-4 py-3 text-sm resize-none"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !attachedFile) || isLoading}
              className="dalek-btn dalek-btn-primary px-4 py-3"
              style={{ minWidth: '42px' }}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <div className="mt-1.5 text-[10px] text-gray-500 font-mono text-center select-none w-full flex justify-center gap-3">
            <span>Type <span className="text-red-400 font-semibold font-sans">help</span> for a list of commands.</span>
            <span>•</span>
            <span>Attach doc & type <strong className="text-red-400 font-mono">create [name]</strong> to compile new system!</span>
          </div>
        </div>
      )}
    </div>
  );
}
