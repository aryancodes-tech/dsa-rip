/**
 * Product chrome and creator contact links shown on the tracker home screen.
 * Keep URLs here - do not hardcode them in route components.
 */

/** Short product name in the compact top bar. */
export const DSA_PRODUCT_DISPLAY_NAME = "dsa.rip";

/**
 * Privacy notice for the footer: progress is browser-local (no account / server sync).
 */
export const DSA_LOCAL_PROGRESS_NOTICE =
  "No servers involved - your progress stays entirely in this browser.";

/**
 * Product differentiator vs sheets that bury LeetCode URLs in hard-to-find UI.
 * Pitch visibility of links (always-on column), not that every row has an LC URL.
 */
export const DSA_LEETCODE_LINKS_PITCH =
  "LeetCode, GFG, and TUF links sit in always-on columns next to each problem - open and obvious, not buried in hard-to-find UI.";

/** Short marketing line for SERP / social when space is tight. */
export const DSA_LEETCODE_LINKS_PITCH_SHORT =
  "A2Z sheet with LeetCode, GFG, and TUF links - right in the grid, not hidden.";

/** Public X/Twitter profile for feedback and contact. */
export const CREATOR_TWITTER_URL = "https://x.com/aryancodes_tech";

/** Handle label for meta / structured data (includes @). */
export const CREATOR_TWITTER_HANDLE = "@aryancodes_tech";

/**
 * Visible footer label for the X profile link - makes feedback intent obvious.
 */
export const CREATOR_FEEDBACK_LINK_LABEL = "Feature Requests / Bugs";

/** Personal portfolio / about site. */
export const CREATOR_PORTFOLIO_URL = "https://aryancodes.tech/";

/** Display name for the “built by” footer credit. */
export const CREATOR_DISPLAY_NAME = "Aryan Gupta";

/**
 * Max characters per problem note. Generous for approach notes; keeps full-sheet
 * notes well within typical ~5 MB localStorage budgets (~3 k × 550 ≈ safe).
 */
export const DSA_NOTE_MAX_CHARS = 3000;
