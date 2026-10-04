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

export async function getProjects(signal) {
  const response = await fetch("/api/projects", { signal });
  const data = await readResponse(response);

  return data.projects;
}

export async function createProject(details) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-SkillBridge-Request": "1",
    },
    body: JSON.stringify(details),
  });

  const data = await readResponse(response);

  return data.project;
}