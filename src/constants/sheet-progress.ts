/**
 * Copy for per-step / per-sub-step solved-status reset.
 * These actions uncheck Status only; revision stars and notes stay as they are.
 */

/** Hover tooltip on the small header reset control. */
export const SHEET_RESET_SOLVED_TOOLTIP = "Reset Progress";

/** Confirmation dialog title. */
export const SHEET_RESET_SOLVED_CONFIRM_TITLE = "Reset progress?";

/**
 * Confirmation dialog body: status-only reset, notes and revision marks are kept.
 */
export const SHEET_RESET_SOLVED_CONFIRM_BODY =
  "Only the status of these questions will be reset. Notes and revision marks will stay as they are.";

/** Cancel action on the confirmation dialog. */
export const SHEET_RESET_SOLVED_CONFIRM_CANCEL = "Cancel";

/** Confirm action on the confirmation dialog. */
export const SHEET_RESET_SOLVED_CONFIRM_ACTION = "Reset";

/**
 * Accessible name for resetting one step's solved checkboxes.
 */
export function sheetResetStepSolvedAriaLabel(stepNo: number, stepTitle: string): string {
  if (stepTitle.length === 0) return `Reset solved status for step ${stepNo}`;
  return `Reset solved status for step ${stepNo}: ${stepTitle}`;
}

/**
 * Accessible name for resetting one subsection's solved checkboxes.
 */
export function sheetResetSubStepSolvedAriaLabel(
  stepNo: number,
  subStepNo: number,
  subStepTitle: string,
): string {
  if (subStepTitle.length === 0) {
    return `Reset solved status for subsection ${stepNo}.${subStepNo}`;
  }
  return `Reset solved status for subsection ${stepNo}.${subStepNo}: ${subStepTitle}`;
}
