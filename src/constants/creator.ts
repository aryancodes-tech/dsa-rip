/**
 * Product chrome and creator contact links shown on the tracker home screen.
 * Keep URLs here - do not hardcode them in route components.
 */

/** Short product name in the compact top bar. */
export const DSA_PRODUCT_DISPLAY_NAME = "DSA Tracker";

/**
 * Privacy notice for the footer: progress is browser-local (no account / server sync).
 */
export const DSA_LOCAL_PROGRESS_NOTICE =
  "No servers involved - your progress stays entirely in this browser.";

/** Public X/Twitter profile for feedback and contact. */
export const CREATOR_TWITTER_URL = "https://x.com/aryancodes_tech";

/** Handle label shown next to the Twitter link (includes @). */
export const CREATOR_TWITTER_HANDLE = "@aryancodes_tech";

/** Personal portfolio / about site. */
export const CREATOR_PORTFOLIO_URL = "https://aryancodes.tech/";

/** Display name for the “built by” footer credit. */
export const CREATOR_DISPLAY_NAME = "Aryan Gupta";

/**
 * Max characters per problem note. Generous for approach notes; keeps full-sheet
 * notes well within typical ~5 MB localStorage budgets (~3 k × 481 ≈ safe).
 */
export const DSA_NOTE_MAX_CHARS = 3000;
