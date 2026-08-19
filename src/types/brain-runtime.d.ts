export interface BrainState {
  version: string;
  compressed_chunks: string;
  index: string[];
  last_sync: number;
}

export interface RuntimeConfig {
  apiKey: string;
  databaseURL: string;
  projectId: string;
}