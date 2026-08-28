'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface FirestoreErrorPayload {
  operationType?: string;
  authInfo?: unknown;
  path?: string;
  error?: string;
}

const CHUNK_RELOAD_KEY = 'last_chunk_reload';
const CHUNK_RELOAD_COOLDOWN_MS = 10000;

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError } = this.props;
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (reporterError) {
        console.error('Error in custom onError boundary handler:', reporterError);
      }
    }

    console.error('Uncaught error inside Neural Boundary:', error, errorInfo);

    const errorMessage = error?.message ?? '';
    const isChunkError =
      errorMessage.includes('Loading chunk') ||
      error?.name === 'ChunkLoadError' ||
      errorMessage.includes('dynamically imported module');

    if (isChunkError) {
      try {
        const lastChunkReload = sessionStorage.getItem(CHUNK_RELOAD_KEY);
        const now = Date.now();
        if (!lastChunkReload || now - parseInt(lastChunkReload, 10) > CHUNK_RELOAD_COOLDOWN_MS) {
          sessionStorage.setItem(CHUNK_RELOAD_KEY, now.toString());
          window.location.reload();
        }
      } catch (storageError) {
        console.warn('Failed to access sessionStorage for chunk reload guard:', storageError);
      }
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleReturnHome = (): void => {
    window.location.href = '/';
  };

  public render(): ReactNode {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    let errorMessage = 'An unexpected error occurred.';
    let isFirestoreError = false;

    if (error?.message) {
      try {
        const parsed = JSON.parse(error.message) as FirestoreErrorPayload;
        if (parsed && typeof parsed === 'object' && parsed.operationType && parsed.authInfo) {
          isFirestoreError = true;
          errorMessage = `Firestore ${parsed.operationType.toUpperCase()} error at path: ${parsed.path ?? 'unknown'}. ${parsed.error ?? 'Unknown database exception'}`;
        }
      } catch {
        errorMessage = error.message;
      }
    }

    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono select-none">
        <div className="max-w-md w-full border border-red-900/30 bg-[#0A0000] p-8 rounded-lg shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-950/50 rounded border border-red-900/50 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-red-500 tracking-tighter uppercase italic">Neural Collapse</h1>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-black border border-red-900/20 rounded text-[10px] text-red-400/80 leading-relaxed overflow-auto max-h-48 font-mono">
                <div className="font-bold mb-1 text-red-500 uppercase tracking-widest text-[8px]">Synaptic Error Signature:</div>
                {errorMessage}
              </div>

              {isFirestoreError && (
                <p className="text-[9px] text-red-600/60 italic uppercase tracking-tight">
                  CRITICAL: Security rules or authentication state preventing neural synchronization.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 p-3 bg-red-950/20 border border-red-900/50 text-red-500 hover:bg-red-900/35 transition-all rounded text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reboot System
              </button>
              <button
                type="button"
                onClick={this.handleReturnHome}
                className="flex items-center justify-center gap-2 p-3 bg-[#111] border border-[#222] text-gray-400 hover:text-white hover:border-gray-700 transition-all rounded text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              >
                <Home className="w-3 h-3" />
                Return Home
              </button>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-1 bg-red-500/10 animate-scanline pointer-events-none" />
        </div>
      </div>
    );
  }
}