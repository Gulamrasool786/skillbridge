import { createContext, useContext } from "react";

export const ProjectsContext = createContext(null);

export function useProjects() {
  const context = useContext(ProjectsContext);

  if (context === null) {
    throw new Error(
      "useProjects must be used inside ProjectsProvider."
    );
  }

  return context;
}