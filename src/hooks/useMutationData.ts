import { useState, useEffect, useCallback, useRef } from 'react';

export interface MutationRecord {
  id?: string;
  timestamp?: number;
  [key: string]: unknown;
}

export interface UseMutationDataResult {
  mutations: MutationRecord[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMutationData(sessionId: string | null | undefined, trigger?: number): UseMutationDataResult {
  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [manualTrigger, setManualTrigger] = useState<number>(0);

  const refetch = useCallback(() => {
    setManualTrigger((prev) => prev + 1);
  }, []);

  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  useEffect(() => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) {
      setMutations([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchMutations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/brain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'get-mutation-history', sessionId: currentSessionId }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          setMutations(Array.isArray(data?.mutations) ? data.mutations : []);
        }
      } catch (err) {
        if (isMounted && err instanceof Error && err.name !== 'AbortError') {
          setError(err);
          setMutations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMutations();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [sessionId, trigger, manualTrigger]);

  return { mutations, loading, error, refetch };
}