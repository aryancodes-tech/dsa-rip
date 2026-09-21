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
export const DSA_SPLASH_TAGLINE = "Your sheet. This browser. That’s it.";

/**
 * Returns how long the splash stays up before auto-dismiss.
 */
export function splashHoldMs(prefersReducedMotion: boolean): number {
  return prefersReducedMotion ? DSA_SPLASH_REDUCED_MOTION_MS : DSA_SPLASH_DURATION_MS;
}
