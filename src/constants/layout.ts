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
 * Minimum inner width for the problem sheet grid on small viewports so columns stay usable;
 * outer wrapper uses horizontal scroll (`overflow-x-auto`).
 *
 * Must stay in sync with `min-w-[34rem]` on the problem-sheet inner wrapper in `routes/index.tsx`.
 */
export const DSA_PROBLEM_GRID_MIN_WIDTH_REM = 34;
