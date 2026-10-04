import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext.js";

function AccountControls() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setBusy(true);
    setError("");

    try {
      await logout();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Log in
      </Link>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-600">{user.name}</span>

        <button
          type="button"
          onClick={handleLogout}
          disabled={busy}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {busy ? "Logging out..." : "Log out"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default AccountControls;