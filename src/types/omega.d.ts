export interface Task<TPayload = Record<string, unknown>> {
  readonly id: string;
  readonly priority: number;
  readonly payload: TPayload;
}

export type Result<TData = unknown, TError = string> = 
  | { readonly success: true; readonly data: TData; readonly error?: never }
  | { readonly success: false; readonly data?: never; readonly error: TError };

export type Unsubscribe = () => void;