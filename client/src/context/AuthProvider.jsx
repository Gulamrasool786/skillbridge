import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from "../services/authService.js";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function checkSession() {
      try {
        const currentUser = await getCurrentUser(controller.signal);

        if (!controller.signal.aborted) {
          setUser(currentUser);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => controller.abort();
  }, [retryKey]);

  async function login(details) {
    const loggedInUser = await loginUser(details);
    setUser(loggedInUser);
  }

  async function logout() {
    await logoutUser();
    setUser(null);
  }

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  function retrySession() {
    setError("");
    setLoading(true);
    setRetryKey((previous) => previous + 1);
  }

  if (loading) {
    return (
      <p role="status" className="p-8 text-slate-600">
        Checking your session...
      </p>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">
          Could not connect to SkillBridge
        </h1>

        <p role="alert" className="mt-4 text-red-700">
          {error}
        </p>

        <button
          onClick={retrySession}
          className="mt-5 rounded-lg bg-violet-600 px-5 py-3 text-white"
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, clearSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;