import { createContext, useContext } from "react";

export const SavedTalentContext = createContext(null);

export function useSavedTalent() {
  const context = useContext(SavedTalentContext);

  if (context === null) {
    throw new Error(
      "useSavedTalent must be used inside SavedTalentProvider."
    );
  }

  return context;
}