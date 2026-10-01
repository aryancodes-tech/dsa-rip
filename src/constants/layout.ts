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
