async function readResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.status = response.status;
    error.fieldErrors = response.status || {};
    throw error;
  }

  return data;
}

export async function getCurrentUser(signal) {
  const response = await fetch("/api/auth/me", {
    credentials: "same-origin",
    signal,
  });

  if (response.status === 401) {
    return null;
  }

  const data = await readResponse(response);
  return data.user;
}

export async function registerUser(details) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-SkillBridge-Request": "1",
    },
    body: JSON.stringify(details),
  });

  const data = await readResponse(response);
  return data.user;
}

export async function loginUser(details) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-SkillBridge-Request": "1",
    },
    body: JSON.stringify(details),
  });

  const data = await readResponse(response);
  return data.user;
}

export async function logoutUser() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "X-SkillBridge-Request": "1",
    },
  });

  await readResponse(response);
}