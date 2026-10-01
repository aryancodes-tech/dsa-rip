/**
 * Problem search combobox: suggestions jump to a row instead of filtering the sheet.
 */

/** Maximum suggestions shown in the dropdown. */
export const SHEET_SEARCH_MAX_SUGGESTIONS = 8;

/** Input placeholder. */
export const SHEET_SEARCH_PLACEHOLDER = "Search problems…";

/** Accessible name for the suggestions listbox. */
export const SHEET_SEARCH_LISTBOX_LABEL = "Problem suggestions";

/** Empty-state copy when the query matches nothing. */
export const SHEET_SEARCH_NO_RESULTS = "No problems found";

/** DOM id of the suggestions listbox (`aria-controls`). */
export const SHEET_SEARCH_LISTBOX_ID = "sheet-search-suggestions";

/** Prefix for option ids (`aria-activedescendant`). */
export const SHEET_SEARCH_OPTION_ID_PREFIX = "sheet-search-option-";

/**
 * Combobox menu: at least as wide as the input, up to 20rem, aligned to the
 * search field's right edge so a narrow toolbar slot still fits titles.
 */
export const SHEET_SEARCH_MENU_CLASS =
  "absolute right-0 top-full z-50 mt-1 max-h-64 min-w-full w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-border bg-popover py-1 text-popover-foreground shadow-lg";

/**
 * Accordion open animation on step/sub-step (`SheetGrid` is 150ms).
 * Used to delay scroll until the target row exists in the DOM.
 */
export const SHEET_SEARCH_ACCORDION_MS = 160;

/** Extra wait after accordion open before scrolling to the row. */
export const SHEET_SEARCH_SCROLL_SETTLE_MS = 80;

/** How long the jumped row stays highlighted. */
export const SHEET_SEARCH_FLASH_MS = 1600;

/**
 * Row highlight while {@link SHEET_SEARCH_FLASH_MS} is active.
 * `!` beats the row's hover background; no color transition so the flash is immediate.
 */
export const SHEET_SEARCH_FLASH_CLASS =
  "!bg-primary/20 ring-2 ring-inset ring-primary/70 hover:!bg-primary/20";

/**
 * Delay before scrolling to a jumped problem.
 * Adds one accordion duration per closed parent (step, then subsection).
 */
export function sheetSearchRevealDelayMs(stepOpen: boolean, subOpen: boolean): number {
  let ms = SHEET_SEARCH_SCROLL_SETTLE_MS;
  if (!stepOpen) ms += SHEET_SEARCH_ACCORDION_MS;
  if (!subOpen) ms += SHEET_SEARCH_ACCORDION_MS;
  return ms;
}

/**
 * Parent-step name shown under a problem title in suggestions.
 * Drops the bracketed topic list so "Heaps [Learning, Medium + Hard]" becomes "Heaps".
 */
export function sheetSearchSectionLabel(stepTitle: string): string {
  if (stepTitle.length === 0) return "";
  const bracket = stepTitle.indexOf("[");
  if (bracket <= 0) return stepTitle.trim();
  const compact = stepTitle.slice(0, bracket).trim();
  if (compact.length === 0) return stepTitle;
  return compact;
}
