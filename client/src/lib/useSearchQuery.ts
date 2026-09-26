import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Search text mirrored to `?q=` so refresh/back/shared links keep the filter.
 * The input reads local state: URL updates apply asynchronously, and binding the
 * input to them directly drops keystrokes while typing fast.
 */
export function useSearchQuery() {
  const [params, setParams] = useSearchParams();
  const [query, setLocal] = useState(() => params.get('q') ?? '');

  const setQuery = (q: string) => {
    setLocal(q);
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (q) next.set('q', q);
        else next.delete('q');
        return next;
      },
      { replace: true }
    );
  };
  return [query, setQuery] as const;
}
