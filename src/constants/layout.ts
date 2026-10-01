/**
 * Main page shell uses `mx-auto max-w-6xl` (72 rem / 1152px) plus horizontal padding
 * (`px-4`, `sm:px-6`, `lg:px-8`). If those change, update
 * {@link FIXED_CHROME_TO_MAIN_SHELL_RIGHT_TAILWIND} accordingly.
 */

/**
 * `right:` utilities so fixed chrome (theme toggle, etc.) lines up with the **inner** right edge of
 * the main column, not the viewport edge.
 */
export const FIXED_CHROME_TO_MAIN_SHELL_RIGHT_TAILWIND =
  "right-[max(1rem,calc((100vw-72rem)/2+1rem))] sm:right-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] lg:right-[max(2rem,calc((100vw-72rem)/2+2rem))]";

/**
 * Minimum inner width for the problem sheet grid so Status / Problem / platform
 * headers stay readable (uppercase labels need room). Outer wrapper scrolls horizontally
 * when the viewport is narrower.
 *
 * Must stay in sync with {@link DSA_PROBLEM_GRID_MIN_WIDTH_CLASS} on the sheet inner wrapper.
 */
export const DSA_PROBLEM_GRID_MIN_WIDTH_REM = 56;

/**
 * Tailwind min-width for the problem-sheet inner wrapper (Status + platforms + TUF).
 * Full class so JIT sees it (no dynamic `min-w-[${n}rem]`).
 */
export const DSA_PROBLEM_GRID_MIN_WIDTH_CLASS = "min-w-[56rem]";

/**
 * Phone-only fade on the right edge of the problem-grid scroller, so the
 * clipped columns read as "scroll for more" instead of a broken table.
 */
export const DSA_SHEET_HSCROLL_EDGE_FADE_CLASS =
  "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-card to-transparent sm:hidden";

/**
 * Hover wash on a step or subsection header row.
 * Applied on the row wrapper so the reset control is inside the highlight.
 */
export const SHEET_HEADER_ROW_HOVER_CLASS = "hover:bg-muted/40 transition-colors";
