export interface Task {
  id: string;
  priority: number;
  payload: Record<string, unknown>;
}

export interface Result {
  success: boolean;
  data?: unknown;
  error?: string;
}

export type Unsubscribe = () => void;