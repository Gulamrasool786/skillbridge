import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.js";
import { startConversation } from "../services/messageService.js";

export default function MessageFreelancerButton({ profileId }) {
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const conversationId = await startConversation(profileId);

      navigate(
        `/messages?conversation=${encodeURIComponent(conversationId)}`
      );
    } catch (error) {
      if (error.status === 401) {
        clearSession();
        navigate("/login");
      } else {
        setError(error.message || "Could not open the conversation.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="mt-5 block rounded-xl bg-violet-600 px-4 py-3 text-center font-semibold text-white hover:bg-violet-700"
      >
        Log in to message
      </Link>
    );
  }

  if (user.role !== "client") {
    return null;
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {busy ? "Opening conversation..." : "Message freelancer"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}