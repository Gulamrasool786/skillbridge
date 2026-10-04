import { useEffect, useState } from "react";
import { ProjectsContext } from "./ProjectsContext.js";
import { useAuth } from "./AuthContext.js";
import {
  getProjects,
  createProject,
} from "../services/projectService.js";

function ProjectsProvider({ children }) {
  const { user, clearSession } = useAuth();

  const userId = user?.role === "client" ? user.id : undefined;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadProjects() {
      setLoading(true);
      setError("");
      setProjects([]);

      try {
        const savedProjects = await getProjects(controller.signal);

        if (!controller.signal.aborted) {
          setProjects(savedProjects);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        if (error.status === 401) {
          clearSession();
        } else {
          setError(error.message || "Could not load projects.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => controller.abort();
  }, [userId, reloadKey, clearSession]);

  function retryLoading() {
    if (!userId) return;

    setError("");
    setLoading(true);
    setReloadKey((previousKey) => previousKey + 1);
  }

  async function addProject(details) {
    if (!userId) {
      throw new Error(
        "Please sign in with a client account to create a project."
      );
    }

    try {
      const savedProject = await createProject(details);

      setProjects((previousProjects) => [
        savedProject,
        ...previousProjects,
      ]);

      return savedProject;
    } catch (error) {
      if (error.status === 401) {
        clearSession();
      }

      throw error;
    }
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        loading,
        error,
        retryLoading,
        addProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export default ProjectsProvider;