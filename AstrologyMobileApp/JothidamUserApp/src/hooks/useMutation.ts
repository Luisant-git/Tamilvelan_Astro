import { useCallback, useState } from 'react';
import { getErrorMessage } from '../services/client';

interface UseMutationResult<TArgs extends any[], TResult> {
  mutate: (...args: TArgs) => Promise<TResult>;
  data: TResult | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

// For "fire on submit" writes (Login, Register, Jathagam generate, Porutham
// match, Kadhal match, Consultation booking, Profile create). `mutate`
// rethrows on failure (in addition to setting `error`) so screens keep their
// existing try/catch + notifyAlert(getErrorMessage(err)) pattern. Deliberately
// no auto-retry — retrying a non-idempotent POST silently risks side effects
// (e.g. double-booking a consultation slot); "retry" for a mutation is just
// pressing submit again.
export function useMutation<TArgs extends any[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>
): UseMutationResult<TArgs, TResult> {
  const [data, setData] = useState<TResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, data, loading, error, reset };
}
