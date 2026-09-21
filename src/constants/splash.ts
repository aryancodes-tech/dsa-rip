/**
 * First-paint splash overlay (logo + name). Keep it short so it feels like an app open, not a loader.
 */

/** Visible duration before auto-dismiss (ms). */
export const DSA_SPLASH_DURATION_MS = 1500;

/** Duration when `prefers-reduced-motion: reduce` is set (ms). */
export const DSA_SPLASH_REDUCED_MOTION_MS = 200;

/** Fade-out length after dismiss (ms). */
export const DSA_SPLASH_EXIT_MS = 380;

/** Line under the product name. */
export const DSA_SPLASH_TAGLINE = "A2Z sheet. Public LeetCode links. This browser.";

/**
 * Cream mat behind the transparent splash lockup in dark mode (`html.dark`).
 * Light/lavender already sit on a light `bg-background`, so they skip the plate.
 */
export const DSA_SPLASH_DARK_LOGO_MAT_BG = "#f7f6f2";

/**
 * Padded rounded square around the splash lockup. Background is `--dsa-splash-dark-logo-mat`
 * (set from {@link DSA_SPLASH_DARK_LOGO_MAT_BG}) and only paints under `.dark`.
 */
export const DSA_SPLASH_DARK_LOGO_MAT_CLASS =
  "flex items-center justify-center dark:rounded-3xl dark:p-5 sm:dark:p-6 dark:bg-[var(--dsa-splash-dark-logo-mat)]";

/**
 * Returns how long the splash stays up before auto-dismiss.
 */
export function splashHoldMs(prefersReducedMotion: boolean): number {
  return prefersReducedMotion ? DSA_SPLASH_REDUCED_MOTION_MS : DSA_SPLASH_DURATION_MS;
}
