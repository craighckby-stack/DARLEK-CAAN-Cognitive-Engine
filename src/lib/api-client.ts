import { safeFetchJson } from './safe-json';

export async function safeApiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ success: boolean; data: T | null; status: number; error?: string }> {
  return safeFetchJson(url, options);
}
