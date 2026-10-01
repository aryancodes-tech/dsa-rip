/**
 * Abacus (https://abacus.jasoncameron.dev) page-view counter.
 * Historical totals live in the seed constant; live hits are added on top.
 */

import { DSA_SITE_ORIGIN } from "@/constants/seo";

/** Public Abacus API origin (no trailing slash). */
export const ABACUS_ORIGIN = "https://abacus.jasoncameron.dev";

/**
 * Canonical host from {@link DSA_SITE_ORIGIN} (`www.dsa.rip`).
 * Apex `dsa.rip` is also treated as production (apex redirects here).
 */
const ABACUS_CANONICAL_HOST = new URL(DSA_SITE_ORIGIN).hostname.toLowerCase();

/** Leading `www.` on the canonical host; stripped for apex / Abacus namespace. */
const ABACUS_WWW_PREFIX = "www.";

const ABACUS_APEX_HOST = ABACUS_CANONICAL_HOST.startsWith(ABACUS_WWW_PREFIX)
  ? ABACUS_CANONICAL_HOST.slice(ABACUS_WWW_PREFIX.length)
  : ABACUS_CANONICAL_HOST;

/** Hostnames that may increment production counters. */
export const ABACUS_PRODUCTION_HOSTS: readonly string[] =
  ABACUS_APEX_HOST === ABACUS_CANONICAL_HOST
    ? [ABACUS_CANONICAL_HOST]
    : [ABACUS_CANONICAL_HOST, ABACUS_APEX_HOST];

/**
 * Abacus namespace (site domain without `www.`).
 * Keys/namespaces must match `^[A-Za-z0-9_-.]{3,64}$`.
 */
export const ABACUS_NAMESPACE = ABACUS_APEX_HOST;

/** Counter key for cumulative page views. */
export const ABACUS_PAGE_VIEWS_KEY = "pageviews";

/** Increment-and-read Abacus path segment. */
export const ABACUS_ACTION_HIT = "hit";

/** Read-only Abacus path segment. */
export const ABACUS_ACTION_GET = "get";

/** Page views already recorded before Abacus was wired up. */
export const ABACUS_PAGE_VIEWS_SEED = 900;

/** Abort hanging Abacus requests so a downed API cannot stall the footer. */
export const ABACUS_FETCH_TIMEOUT_MS = 4000;

/** Short footer label after the page-view number. */
export const ABACUS_PAGE_VIEWS_SHORT_LABEL = "views";

/** Accessible phrase for page views (screen readers). */
export const ABACUS_PAGE_VIEWS_ARIA_LABEL = "page views";
