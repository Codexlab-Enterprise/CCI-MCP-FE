import React from "react";

export const useFetch = <T>(
  fetchFunction: () => Promise<T>,
  autoFetch = true,
) => {
  const fetchRef = React.useRef(fetchFunction);

  // Update the ref only when fetchFunction changes
  React.useEffect(() => {
    fetchRef.current = fetchFunction;
  }, [fetchFunction]);

  const [loading, setLoading] = React.useState(autoFetch); // Initialize based on autoFetch
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchRef.current();

      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array is okay here because we're using ref

  React.useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]); // Add dependencies to prevent stale closures

  const reset = React.useCallback(() => {
    setData(null);
    setError(null);
    setLoading(true);
  }, []);

  return { loading, data, error, refetch: fetchData, reset };
};
