import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import {
  markConversationRead,
  notifyInboxChanged,
} from "../services/messageService.js";

export default function ConversationReadMarker({
  conversationId,
  messageId,
}) {
  const markerRef = useRef(null);
  const { clearSession } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!messageId || !markerRef.current) return;

    let stopped = false;
    let visible = false;
    let running = false;
    let completed = false;

    const controller = new AbortController();

    setError("");

    async function markRead() {
      if (
        stopped ||
        completed ||
        running ||
        !visible ||
        document.visibilityState !== "visible" ||
        !document.hasFocus()
      ) {
        return;
      }

      running = true;

      try {
        await markConversationRead(
          conversationId,
          messageId,
          controller.signal
        );

        if (!stopped) {
          completed = true;
          setError("");
          notifyInboxChanged();
        }
      } catch (requestError) {
        if (!stopped && !controller.signal.aborted) {
          if (requestError.status === 401) {
            clearSession();
          } else {
            setError(
              "Read status could not update. Retrying automatically."
            );
          }
        }
      } finally {
        running = false;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        markRead();
      },
      { threshold: 1 }
    );

    observer.observe(markerRef.current);

    const timer = window.setInterval(markRead, 5000);

    window.addEventListener("focus", markRead);
    document.addEventListener("visibilitychange", markRead);

    return () => {
      stopped = true;
      controller.abort();
      observer.disconnect();
      clearInterval(timer);

      window.removeEventListener("focus", markRead);
      document.removeEventListener(
        "visibilitychange",
        markRead
      );
    };
  }, [conversationId, messageId, clearSession]);

  return (
    <div>
      <div ref={markerRef} className="h-px" aria-hidden="true" />

      {error && (
        <p role="status" className="mt-2 text-xs text-amber-700">
          {error}
        </p>
      )}
    </div>
  );
}