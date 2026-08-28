/**
 * @file src/types/omega.d.ts
 * @version 4.9.0-core
 * @description Sovereign Neural Code Optimized Type Definitions
 */

export interface Task<TPayload = Readonly<Record<string, unknown>>> {
  readonly id: string;
  readonly priority: number;
  readonly payload: TPayload;
}

export type Result<TData = unknown, TError = Error | string> = 
  | Readonly<{ readonly success: true; readonly data: TData; readonly error?: never }>
  | Readonly<{ readonly success: false; readonly data?: never; readonly error: TError }>;

export type Unsubscribe = () => void;