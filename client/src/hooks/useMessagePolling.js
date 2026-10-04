import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.js";

export default function useMessagePolling(
  load,
  enabled = true,
  listenForInboxChanges = false
) {
  const { clearSession } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refreshRef = useRef(() => {});

  const refresh = useCallback(() => {
    refreshRef.current();
  }, []);

  useEffect(() => {
    let stopped = false;
    let running = false;
    let queued = false;
    let timer;
    let controller;

    setData(null);
    setError("");
    setLoading(enabled);
    setRefreshing(false);

    if (!enabled) {
      refreshRef.current = () => {};
      return;
    }

    async function run() {
      if (stopped) return;

      if (running) {
        queued = true;
        return;
      }

      clearTimeout(timer);

      if (document.visibilityState !== "visible") {
        return;
      }

      running = true;
      controller = new AbortController();
      setRefreshing(true);

      try {
        const result = await load(controller.signal);

        if (!stopped && !controller.signal.aborted) {
          setData(result);
          setError("");
        }
      } catch (requestError) {
        if (!stopped && !controller.signal.aborted) {
          if (requestError.status === 401) {
            clearSession();
          } else {
            setError(requestError.message);
          }
        }
      } finally {
        running = false;

        if (!stopped) {
          setLoading(false);
          setRefreshing(false);

          const delay = queued ? 0 : 5000;
          queued = false;

          timer = window.setTimeout(run, delay);
        }
      }
    }

    function handleVisibility() {
      clearTimeout(timer);

      if (document.visibilityState === "visible") {
        run();
      }
    }

    refreshRef.current = run;

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    if (listenForInboxChanges) {
      window.addEventListener(
        "skillbridge:inbox-changed",
        run
      );
    }

    run();

    return () => {
      stopped = true;
      clearTimeout(timer);
      controller?.abort();
      refreshRef.current = () => {};

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      window.removeEventListener(
        "skillbridge:inbox-changed",
        run
      );
    };
  }, [load, enabled, listenForInboxChanges, clearSession]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
  };
}