export const logEvolutionEvent = (event: string, data: any) => {
  console.log(`[EVOLUTION_EVENT][${new Date().toISOString()}] ${event}:`, JSON.stringify(data));
};

export const calculateSaturationScore = (metrics: any) => {
  return Object.values(metrics).reduce((a: any, b: any) => a + b, 0);
};