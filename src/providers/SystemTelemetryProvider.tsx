"use client";

import React, { createContext, useContext, useEffect } from 'react';

const TelemetryContext = createContext({});

export const SystemTelemetryProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    console.log("[DARLEK-CANN] System Telemetry Initialized: Quantum-Ready");
  }, []);

  return (
    <TelemetryContext.Provider value={{ status: 'active', node: 'omega-core' }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => useContext(TelemetryContext);