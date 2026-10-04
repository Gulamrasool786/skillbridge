import { useSavedTalent } from "../context/SavedTalentContext.js";

function SaveTalentButton({ freelancerId }) {
  const { isSaved, toggleSaved } = useSavedTalent();

  const saved = isSaved(freelancerId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => toggleSaved(freelancerId)}
      className={`mt-3 w-full rounded-lg border px-4 py-3 text-sm font-semibold transition ${
        saved
          ? "border-violet-200 bg-violet-50 text-violet-700"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {saved ? "Remove from saved" : "Save freelancer"}
    </button>
  );
}

export default SaveTalentButton;