async function readResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.status = response.status;
    error.fieldErrors = data.errors || {};
    throw error;
  }

  return data;
}

export async function getMyProfile(signal) {
  const response = await fetch("/api/freelancer-profiles/me", {
    credentials: "same-origin",
    signal,
  });

  const data = await readResponse(response);
  return data.profile;
}

export async function saveMyProfile(details) {
  const response = await fetch("/api/freelancer-profiles/me", {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-SkillBridge-Request": "1",
    },
    body: JSON.stringify(details),
  });

  const data = await readResponse(response);
  return data.profile;
}

export async function updateMyProfileStatus(status) {
  const response = await fetch("/api/freelancer-profiles/me/status", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-SkillBridge-Request": "1",
    },
    body: JSON.stringify({ status }),
  });

  const data = await readResponse(response);
  return data.profile;
}