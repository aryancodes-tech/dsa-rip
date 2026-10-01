/**
 * Product tour (coachmarks) - step ids are also `data-tour` attribute values on the sheet UI.
 */

/** localStorage flag value when the user has finished or skipped the tour. */
export const DSA_TOUR_DONE_VALUE = "1";

/**
 * True when `stored` is the completed-tour flag.
 */
export function isTourCompleted(stored: string | null): boolean {
  if (stored === null || stored.length === 0) return false;
  return stored === DSA_TOUR_DONE_VALUE;
}

export type SheetTourStepId =
  | "progress"
  | "difficulty"
  | "theme"
  | "settings"
  | "filters"
  | "search";

export type SheetTourStep = {
  /** Matches `data-tour` on the highlighted element. */
  id: SheetTourStepId;
  title: string;
  body: string;
  /** Preferred popover placement relative to the target. */
  placement: "bottom" | "top" | "left" | "right";
};

/** Ordered coachmark steps shown on first visit (and when replaying from Settings). */
export const SHEET_TOUR_STEPS: readonly SheetTourStep[] = [
  {
    id: "progress",
    title: "Your progress",
    body: "Track how many problems you’ve solved overall. Everything stays in this browser - no account needed.",
    placement: "bottom",
  },
  {
    id: "difficulty",
    title: "Difficulty breakdown",
    body: "See solved counts for Easy, Medium, and Hard at a glance.",
    placement: "bottom",
  },
  {
    id: "theme",
    title: "Theme",
    body: "Switch between Light, Dark, and Lavender anytime.",
    placement: "bottom",
  },
  {
    id: "settings",
    title: "Settings",
    body: "Reset progress, or choose which columns appear in the sheet. Check a column to show it - LeetCode, GFG, and TUF always stay on.",
    placement: "left",
  },
  {
    id: "filters",
    title: "Filters",
    body: "Narrow by difficulty or solved status. Use Revision to show only problems you've starred for review.",
    placement: "bottom",
  },
  {
    id: "search",
    title: "Search",
    body: "Search problem titles, then pick a result to jump there. On desktop, press ⌘ K (Ctrl K) to focus search.",
    placement: "bottom",
  },
] as const;
