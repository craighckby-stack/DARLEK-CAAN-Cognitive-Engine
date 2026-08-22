export const logEvolutionEvent = (event: string, data: any) => {
  let serialized = '';
  try {
    serialized = JSON.stringify(data);
  } catch {
    serialized = '[Unserializable Data]';
  }
  console.log(`[EVOLUTION_EVENT][${new Date().toISOString()}] ${event}:`, serialized);
};

export const calculateSaturationScore = (metrics: any) => {
  return Object.values(metrics).reduce((a: any, b: any) => a + b, 0);
};