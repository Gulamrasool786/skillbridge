async function request(path, options = {}) {
  const response = await fetch(`/api/conversations${path}`, {
    credentials: "same-origin",
    ...options,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    const error = new Error(
      `The server returned an unreadable response (${response.status}).`
    );

    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(
      data.message || "Request failed."
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

function jsonRequest(method, body, signal) {
  return {
    method,
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-SkillBridge-Request": "1",
    },
    body: JSON.stringify(body),
  };
}

export async function startConversation(profileId) {
  const data = await request(
    "",
    jsonRequest("POST", { profileId })
  );

  return data.conversationId;
}

export async function getConversations(signal) {
  const data = await request("", { signal });
  return data.conversations;
}

export function getMessages(
  conversationId,
  signal,
  before
) {
  const query = before
    ? `?before=${encodeURIComponent(before)}`
    : "";

  return request(
    `/${encodeURIComponent(conversationId)}/messages${query}`,
    { signal }
  );
}

export async function sendMessage(
  conversationId,
  text,
  requestId
) {
  const data = await request(
    `/${encodeURIComponent(conversationId)}/messages`,
    jsonRequest("POST", { text, requestId })
  );

  return data.message;
}

export function markConversationRead(
  conversationId,
  messageId,
  signal
) {
  return request(
    `/${encodeURIComponent(conversationId)}/read`,
    jsonRequest("PATCH", { messageId }, signal)
  );
}

export function notifyInboxChanged() {
  window.dispatchEvent(
    new Event("skillbridge:inbox-changed")
  );
}