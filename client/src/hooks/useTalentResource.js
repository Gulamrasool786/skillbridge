import { useEffect, useState } from "react";

export default function useTalentResource(path) {
  const [attempt, setAttempt] = useState(0);

  const [result, setResult] = useState({
    path: null,
    attempt: -1,
    data: null,
    error: "",
    notFound: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(path, {
          signal: controller.signal,
          cache: "no-store",
        });

        const data = await response.json();

        if (controller.signal.aborted) return;

        if (!response.ok) {
          setResult({
            path,
            attempt,
            data: null,
            error: data.message || "Could not load talent.",
            notFound: response.status === 404,
          });
          return;
        }

        setResult({
          path,
          attempt,
          data,
          error: "",
          notFound: false,
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        setResult({
          path,
          attempt,
          data: null,
          error: error.message || "Could not connect to the server.",
          notFound: false,
        });
      }
    }

    load();

    return () => controller.abort();
  }, [path, attempt]);

  const loading =
    result.path !== path || result.attempt !== attempt;

  function retry() {
    setAttempt((previous) => previous + 1);
  }

  return {
    loading,
    data: loading ? null : result.data,
    error: loading ? "" : result.error,
    notFound: loading ? false : result.notFound,
    retry,
  };
}