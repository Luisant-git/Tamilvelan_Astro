import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../services/client';

interface UseFetchOptions {
  enabled?: boolean;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// For "fetch on mount" reads (Panchang, Astrologer list, History lists,
// Reports). `loading` is only true while there's no data yet; `refetch`
// (RefreshControl / "Try Again") uses `refreshing` instead so pull-to-refresh
// doesn't blank an already-populated screen. Pass `enabled: false` to skip
// the automatic fetch-on-mount (e.g. RasiPalanScreen fetches per rasi on tap
// instead of all 12 on mount).
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const { enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasData = useRef(false);

  const run = useCallback(async () => {
    if (hasData.current) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      hasData.current = true;
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (enabled) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, run]);

  return { data, loading, refreshing, error, refetch: run };
}
