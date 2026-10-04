import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext.js";
import useMessagePolling from "../hooks/useMessagePolling.js";
import ConversationReadMarker from "../components/ConversationReadMarker.jsx";
import {
  getConversations,
  getMessages,
  sendMessage,
  notifyInboxChanged,
} from "../services/messageService.js";

const secondaryButton =
  "rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50";

function formatInboxTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    ...(date.getFullYear() !== now.getFullYear()
      ? { year: "numeric" }
      : {}),
  });
}

function getInitials(name) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => Array.from(part)[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function mergeMessages(previous, incoming) {
  const messagesById = new Map(
    previous.map((message) => [message.id, message])
  );

  for (const message of incoming) {
    messagesById.set(message.id, message);
  }

  return [...messagesById.values()].sort((a, b) =>
    a.id.localeCompare(b.id)
  );
}

async function fetchRecentMessages(
  conversationId,
  signal,
  latestId
) {
  const firstPage = await getMessages(
    conversationId,
    signal
  );

  let page = firstPage;
  let messages = firstPage.messages;

  while (
    latestId &&
    page.hasOlder &&
    page.messages.length > 0 &&
    page.messages[0].id > latestId
  ) {
    page = await getMessages(
      conversationId,
      signal,
      page.messages[0].id
    );

    messages = mergeMessages(page.messages, messages);
  }

  return {
    messages,
    hasOlder: firstPage.hasOlder,
  };
}

function ConversationThread({ conversation }) {
  const { user, clearSession } = useAuth();

  const [messages, setMessages] = useState([]);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState("");
  const [ready, setReady] = useState(false);

  const activeRef = useRef(false);
  const initializedRef = useRef(false);
  const latestIdRef = useRef(null);
  const olderControllerRef = useRef(null);
  const sendLockRef = useRef(false);
  const pendingSendRef = useRef(null);
  const scrollRef = useRef(null);
  const nearBottomRef = useRef(true);
  const forceBottomRef = useRef(false);
  const historyPositionRef = useRef(null);

  useEffect(() => {
    activeRef.current = true;

    return () => {
      activeRef.current = false;
      olderControllerRef.current?.abort();
    };
  }, []);

  const load = useCallback(
    (signal) =>
      fetchRecentMessages(
        conversation.id,
        signal,
        latestIdRef.current
      ),
    [conversation.id]
  );

  const {
    data,
    loading,
    refreshing,
    error,
    refresh,
  } = useMessagePolling(load);

  useEffect(() => {
    if (!data) return;

    if (!initializedRef.current) {
      initializedRef.current = true;
      setReady(true);
      setHasOlder(data.hasOlder);
      forceBottomRef.current = true;
    }

    const newest = data.messages.at(-1)?.id;

    if (
      newest &&
      (!latestIdRef.current || newest > latestIdRef.current)
    ) {
      latestIdRef.current = newest;
    }

    setMessages((previous) =>
      mergeMessages(previous, data.messages)
    );
  }, [data]);

  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;

    const historyPosition = historyPositionRef.current;

    if (historyPosition) {
      box.scrollTop =
        historyPosition.top +
        box.scrollHeight -
        historyPosition.height;

      historyPositionRef.current = null;
      return;
    }

    if (forceBottomRef.current || nearBottomRef.current) {
      box.scrollTop = box.scrollHeight;
      forceBottomRef.current = false;
    }
  }, [messages]);

  function handleScroll() {
    const box = scrollRef.current;
    if (!box) return;

    nearBottomRef.current =
      box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  }

  async function loadOlder() {
    if (
      !messages.length ||
      olderControllerRef.current ||
      sending
    ) {
      return;
    }

    const controller = new AbortController();
    olderControllerRef.current = controller;

    setLoadingOlder(true);
    setActionError("");
    nearBottomRef.current = false;

    try {
      const result = await getMessages(
        conversation.id,
        controller.signal,
        messages[0].id
      );

      if (!activeRef.current || controller.signal.aborted) {
        return;
      }

      const box = scrollRef.current;

      if (box) {
        historyPositionRef.current = {
          top: box.scrollTop,
          height: box.scrollHeight,
        };
      }

      setMessages((previous) =>
        mergeMessages(result.messages, previous)
      );

      setHasOlder(result.hasOlder);
    } catch (requestError) {
      if (activeRef.current && !controller.signal.aborted) {
        if (requestError.status === 401) {
          clearSession();
        } else {
          setActionError(requestError.message);
        }
      }
    } finally {
      olderControllerRef.current = null;

      if (activeRef.current) {
        setLoadingOlder(false);
      }
    }
  }

  async function handleSend(event) {
    event.preventDefault();

    const text = draft.trim();

    if (
      !text ||
      text.length > 2000 ||
      sendLockRef.current ||
      loadingOlder ||
      !ready
    ) {
      return;
    }

    sendLockRef.current = true;
    setSending(true);
    setActionError("");

    if (pendingSendRef.current?.text !== text) {
      pendingSendRef.current = {
        text,
        requestId: crypto.randomUUID(),
      };
    }

    try {
      const message = await sendMessage(
        conversation.id,
        text,
        pendingSendRef.current.requestId
      );

      if (!activeRef.current) return;

      forceBottomRef.current = true;

      setMessages((previous) =>
        mergeMessages(previous, [message])
      );

      setDraft("");
      pendingSendRef.current = null;

      refresh();
      notifyInboxChanged();
    } catch (requestError) {
      if (activeRef.current) {
        if (requestError.status === 401) {
          clearSession();
        } else {
          setActionError(requestError.message);
        }
      }
    } finally {
      sendLockRef.current = false;

      if (activeRef.current) {
        setSending(false);
      }
    }
  }

  const readThroughId = data?.messages.at(-1)?.id;

  return (
    <section
      aria-label={`Conversation with ${conversation.otherName}`}
      className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-lg font-semibold">
            {conversation.otherName}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Checks for new messages every 5 seconds
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className={secondaryButton}
        >
          {refreshing ? "Checking…" : "Refresh"}
        </button>
      </header>

      {error && (
        <p
          role="alert"
          className="bg-amber-50 px-5 py-3 text-sm text-amber-800"
        >
          {error} Retrying automatically.
        </p>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="max-h-[60vh] min-h-64 space-y-4 overflow-y-auto p-5"
      >
        {loading && !ready && (
          <p role="status" className="text-slate-500">
            Loading messages…
          </p>
        )}

        {hasOlder && (
          <div className="text-center">
            <button
              type="button"
              onClick={loadOlder}
              disabled={loadingOlder || sending}
              className={secondaryButton}
            >
              {loadingOlder ? "Loading…" : "Load older messages"}
            </button>
          </div>
        )}

        {ready && messages.length === 0 && (
          <p className="text-center text-slate-500">
            Start the conversation with a message.
          </p>
        )}

        {messages.map((message) => {
          const mine = message.senderId === user.id;

          return (
            <div
              key={message.id}
              className={`flex ${
                mine ? "justify-end" : "justify-start"
              }`}
            >
              <article
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  mine
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                <p className="text-xs font-semibold">
                  {mine ? "You" : conversation.otherName}
                </p>

                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                  {message.text}
                </p>

                <time
                  dateTime={message.createdAt}
                  className={`mt-2 block text-xs ${
                    mine ? "text-violet-100" : "text-slate-500"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleString()}
                </time>
              </article>
            </div>
          );
        })}

        {ready && readThroughId && (
          <ConversationReadMarker
            conversationId={conversation.id}
            messageId={readThroughId}
          />
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-slate-100 p-5"
      >
        <label
          htmlFor="message-text"
          className="block text-sm font-medium"
        >
          Your message
        </label>

        <textarea
          id="message-text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={2000}
          rows={3}
          required
          disabled={sending || !ready}
          placeholder="Write your message…"
          className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
        />

        {actionError && (
          <p
            role="alert"
            className="mt-3 text-sm text-red-700"
          >
            {actionError}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {draft.length}/2000
          </span>

          <button
            type="submit"
            disabled={
              sending ||
              loadingOlder ||
              !ready ||
              !draft.trim()
            }
            className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send message"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedId = searchParams.get("conversation");

  const {
    data,
    loading,
    refreshing,
    error,
    refresh,
  } = useMessagePolling(
    getConversations,
    Boolean(user),
    true
  );

  const conversations = data ?? [];

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId
  );

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Messages
          </h1>

          <p className="mt-3 text-slate-500">
            Your most recent conversations appear first.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className={secondaryButton}
        >
          {refreshing ? "Checking…" : "Refresh inbox"}
        </button>
      </div>

      {loading && (
        <p role="status" className="mt-6 text-slate-500">
          Loading your inbox…
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-amber-50 p-4 text-amber-800"
        >
          {error} Retrying automatically.
        </p>
      )}

      {data && conversations.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8">
          <h2 className="text-xl font-semibold">
            No conversations yet
          </h2>

          <p className="mt-3 text-slate-500">
            {user?.role === "client"
              ? "Open a freelancer profile to start a conversation."
              : "Conversations will appear here when a client messages you."}
          </p>

          <Link
            to="/talent"
            className="mt-5 inline-block font-semibold text-violet-700 hover:underline"
          >
            Discover talent
          </Link>
        </div>
      )}

      {conversations.length > 0 && (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <nav
            aria-label="Conversations"
            className="min-w-0 space-y-2 rounded-2xl border border-slate-200 bg-white p-3"
          >
            {conversations.map((conversation) => {
              const selected =
                selectedId === conversation.id;

              const unread =
                conversation.unreadCount > 0;

              const lastMessage =
                conversation.lastMessage;

              const preview = lastMessage
                ? `${
                    lastMessage.senderId === user.id
                      ? "You: "
                      : ""
                  }${lastMessage.text}`
                : "No messages yet — say hello.";

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() =>
                    setSearchParams({
                      conversation: conversation.id,
                    })
                  }
                  aria-current={
                    selected ? "true" : undefined
                  }
                  className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                    selected
                      ? "bg-violet-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700"
                  >
                    {getInitials(conversation.otherName)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm font-semibold ${
                          selected
                            ? "text-violet-700"
                            : "text-slate-900"
                        }`}
                      >
                        {conversation.otherName}
                      </span>

                      {lastMessage && (
                        <time
                          dateTime={lastMessage.createdAt}
                          title={new Date(
                            lastMessage.createdAt
                          ).toLocaleString()}
                          className="shrink-0 text-xs text-slate-500"
                        >
                          {formatInboxTime(
                            lastMessage.createdAt
                          )}
                        </time>
                      )}
                    </span>

                    <span className="mt-1 block text-xs capitalize text-slate-500">
                      {conversation.otherRole}
                    </span>

                    <span className="mt-2 flex items-center justify-between gap-2">
                      <span
                        title={preview}
                        className={`min-w-0 truncate text-sm ${
                          unread
                            ? "font-semibold text-slate-800"
                            : "text-slate-500"
                        }`}
                      >
                        {preview}
                      </span>

                      {unread && (
                        <span
                          aria-label={`${conversation.unreadCount} unread messages`}
                          className="shrink-0 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white"
                        >
                          {conversation.unreadCount > 99
                            ? "99+"
                            : conversation.unreadCount}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          {selectedConversation ? (
            <ConversationThread
              key={`${user.id}:${selectedConversation.id}`}
              conversation={selectedConversation}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
              {selectedId
                ? "This conversation is unavailable."
                : "Choose a conversation to read and reply."}
            </div>
          )}
        </div>
      )}
    </section>
  );
}