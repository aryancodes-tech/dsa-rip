/**
 * Copy and chrome for the branded load-failure screen
 * (React error boundary and SSR HTML fallback).
 * Retry first; if the sheet stays broken, send the user to the public X profile.
 *
 * Fallback colors stay in lockstep with the light `:root` palette in `src/styles.css`.
 */

/** Document title and heading for a failed page load. */
export const ERROR_PAGE_TITLE = "This page didn't load";

/** Short explanation shown under the heading. */
export const ERROR_PAGE_BODY = "Something went wrong on our end.";

/** Label for the retry control. */
export const ERROR_PAGE_RETRY_LABEL = "Try again";

/** Visible label for the X/Twitter contact control. */
export const ERROR_PAGE_CONTACT_LABEL = "Tell me on X";

/** Cream page wash — matches `:root --background`. */
export const ERROR_PAGE_BG = "oklch(0.97 0.012 80)";

/** Warm brown body text — matches `:root --foreground`. */
export const ERROR_PAGE_FG = "oklch(0.28 0.02 60)";

/** Muted supporting copy — matches `:root --muted-foreground`. */
export const ERROR_PAGE_MUTED = "oklch(0.5 0.025 65)";

/** Brownish primary fill — matches `:root --primary`. */
export const ERROR_PAGE_PRIMARY = "oklch(0.55 0.09 55)";

/** Cream text on the primary fill — matches `:root --primary-foreground`. */
export const ERROR_PAGE_PRIMARY_FG = "oklch(0.98 0.01 80)";

/** Soft card fill for the contact chip — matches `:root --card`. */
export const ERROR_PAGE_CARD = "oklch(0.985 0.008 80)";

/** Warm hairline — matches `:root --border`. */
export const ERROR_PAGE_BORDER = "oklch(0.88 0.018 75)";

/** Hover wash on the contact chip — matches `:root --muted`. */
export const ERROR_PAGE_MUTED_BG = "oklch(0.93 0.014 75)";

/** Shared radius for error-page actions (`rounded-xl`). */
export const ERROR_PAGE_ACTION_RADIUS = "0.75rem";

/**
 * Filled retry control on the React error boundary.
 * Same brownish `bg-primary` as the rest of the sheet chrome.
 */
export const ERROR_PAGE_RETRY_BTN_CLASS =
  "cursor-pointer inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90";

/**
 * Outlined X contact chip on the React error boundary.
 */
export const ERROR_PAGE_CONTACT_BTN_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted";
