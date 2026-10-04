import { useState } from "react";
import { SavedTalentContext } from "./SavedTalentContext.js";

export default function SavedTalentProvider({ children }) {
  const [savedIds, setSavedIds] = useState([]);

  function isSaved(freelancerId) {
    return savedIds.includes(freelancerId);
  }

  function toggleSaved(freelancerId) {
    setSavedIds((previousIds) =>
      previousIds.includes(freelancerId)
        ? previousIds.filter((id) => id !== freelancerId)
        : [...previousIds, freelancerId]
    );
  }

  return (
    <SavedTalentContext.Provider
      value={{ savedIds, isSaved, toggleSaved }}
    >
      {children}
    </SavedTalentContext.Provider>
  );
}