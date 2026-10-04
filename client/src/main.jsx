import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App.jsx";
import AuthProvider from "./context/AuthProvider.jsx";
import { useAuth } from "./context/AuthContext.js";
import SavedTalentProvider from "./context/SavedTalentProvider.jsx";
import ProjectsProvider from "./context/ProjectsProvider.jsx";

import "./index.css";

function AppProviders() {
  const { user } = useAuth();

  return (
    <SavedTalentProvider key={user?.id ?? "guest"}>
      <ProjectsProvider>
        <App />
      </ProjectsProvider>
    </SavedTalentProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProviders />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);