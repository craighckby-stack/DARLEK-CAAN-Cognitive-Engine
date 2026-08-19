export interface DiagnosticModule {
  id: string;
  check: () => Promise<number>;
}

export const DiagnosticRegistry: DiagnosticModule[] = [
  { id: 'memory-leak-detector', check: async () => 0 },
  { id: 'entropy-analyzer', check: async () => 0.5 }
];