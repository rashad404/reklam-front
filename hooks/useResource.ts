"use client";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api/client";
export function useResource<T>(url: string | null) {
  const [state, setState] = useState<{
    key: string;
    data: T | null;
    loading: boolean;
    error: boolean;
  }>({ key: "", data: null, loading: true, error: false });
  const [version, setVersion] = useState(0);
  const key = JSON.stringify([url, version]);
  const retry = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    api
      .get(url, { signal: controller.signal })
      .then((r) => {
        if (!controller.signal.aborted)
          setState({ key, data: r.data.data, loading: false, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setState({ key, data: null, loading: false, error: true });
      });
    return () => controller.abort();
  }, [url, key]);
  return state.key === key
    ? { ...state, retry }
    : { data: null, loading: Boolean(url), error: false, retry };
}
