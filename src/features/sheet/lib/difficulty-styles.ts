/** Tailwind classes for Easy / Medium / Hard badges. */
export const DIFFICULTY_BADGE_CLASS: Record<string, string> = {
  Easy: "bg-[color:var(--easy)]/15 text-[color:var(--easy)] border-[color:var(--easy)]/30",
  Medium: "bg-[color:var(--medium)]/15 text-[color:var(--medium)] border-[color:var(--medium)]/30",
  Hard: "bg-[color:var(--hard)]/15 text-[color:var(--hard)] border-[color:var(--hard)]/30",
};

/** Solid dots used next to difficulty labels. */
export const DIFFICULTY_DOT_CLASS: Record<string, string> = {
  Easy: "bg-[color:var(--easy)]",
  Medium: "bg-[color:var(--medium)]",
  Hard: "bg-[color:var(--hard)]",
};
