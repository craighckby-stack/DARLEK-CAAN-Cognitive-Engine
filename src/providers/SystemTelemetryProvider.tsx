"use client";

import React, { createContext, useContext, useMemo, type JSX, type ReactNode } from 'react';

export interface SystemTelemetryContextType {
  readonly status: 'active';
  readonly node: 'omega-core';
}

const TelemetryContext = createContext<SystemTelemetryContextType | undefined>(undefined);

export interface SystemTelemetryProviderProps {
  readonly children: ReactNode;
}

export const SystemTelemetryProvider = ({ children }: SystemTelemetryProviderProps): JSX.Element => {
  useMemo(() => {
    try {
      console.info("[DARLEK-CANN] System Telemetry Initialized: Quantum-Ready");
    } catch (error: unknown) {
      console.error("[DARLEK-CANN] Telemetry Initialization Error:", error);
    }
  }, []);

  const telemetryValue = useMemo<SystemTelemetryContextType>(
    () => ({
      status: 'active',
      node: 'omega-core',
    }),
    []
  );

  return (
    <TelemetryContext.Provider value={telemetryValue}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = (): SystemTelemetryContextType => {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error('useTelemetry must be used within a SystemTelemetryProvider');
  }
  return context;
};