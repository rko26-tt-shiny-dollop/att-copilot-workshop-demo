import { useEffect, useState } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Tiny data-fetching hook used by the list pages. */
export function useFetch<T>(loader: () => Promise<T>): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    loader()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch(
        (err: unknown) =>
          active &&
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : "Failed to load",
          })
      );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
