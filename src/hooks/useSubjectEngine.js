export const useSubjectEngine = (actor) => {
  if (!actor) return { wearText: "wearing", isHuman: true };
  const isHuman = actor.subject_mode !== "NONHUMAN";
  return {
    wearText: isHuman ? "wearing" : "presented with",
    isHuman: isHuman
  };
};