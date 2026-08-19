import { useState, useEffect } from 'react';

export function useMutationData(sessionId: string, trigger?: number) {
  const [mutations, setMutations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    
    fetch('/api/brain', {
      method: 'POST',
      body: JSON.stringify({ action: 'get-mutation-history', sessionId }),
    })
      .then(res => res.json())
      .then(data => {
        if (active) {
          setMutations(data.mutations || []);
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, [sessionId, trigger]);

  return { mutations, loading };
}