"use client";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api/client";
export function useResource<T>(url: string | null) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: boolean;
  }>({ data: null, loading: true, error: false });
  const [version, setVersion] = useState(0);
  const retry = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    api
      .get(url, { signal: controller.signal })
      .then((r) => {
        setState({ data: r.data.data, loading: false, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setState({ data: null, loading: false, error: true });
      });
    return () => controller.abort();
  }, [url, version]);
  return { ...state, retry };
}
