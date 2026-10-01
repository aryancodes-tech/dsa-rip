/**
 * Abacus page-view helpers: URL composition, response parsing, and seed totals.
 * Network I/O stays in {@link fetchAbacusValue} / {@link recordPageViews}.
 */

import {
  ABACUS_ACTION_GET,
  ABACUS_ACTION_HIT,
  ABACUS_FETCH_TIMEOUT_MS,
  ABACUS_NAMESPACE,
  ABACUS_ORIGIN,
  ABACUS_PAGE_VIEWS_ARIA_LABEL,
  ABACUS_PAGE_VIEWS_KEY,
  ABACUS_PAGE_VIEWS_SEED,
  ABACUS_PAGE_VIEWS_SHORT_LABEL,
  ABACUS_PRODUCTION_HOSTS,
} from "@/constants/abacus";

type AbacusAction = typeof ABACUS_ACTION_HIT | typeof ABACUS_ACTION_GET;

/**
 * True when `hostname` is the production site (apex or www).
 * Preview / localhost hosts must not increment the live counter.
 */
export function isAbacusProductionHost(hostname: string): boolean {
  if (hostname.length === 0) return false;
  const host = hostname.toLowerCase();
  return ABACUS_PRODUCTION_HOSTS.some((allowed) => allowed === host);
}

/**
 * Builds a GET `/hit` or `/get` URL for the page-view counter.
 * Returns an empty string when namespace or key is missing.
 */
export function composeAbacusUrl(action: AbacusAction, namespace: string, key: string): string {
  if (action.length === 0 || namespace.length === 0 || key.length === 0) return "";
  return `${ABACUS_ORIGIN}/${action}/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`;
}

/**
 * Reads `{ value }` from an Abacus JSON body.
 * Returns null when the payload is missing, negative, or non-finite.
 */
export function parseAbacusValue(body: unknown): number | null {
  if (body === null || typeof body !== "object" || !("value" in body)) return null;
  const value = (body as { value: unknown }).value;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  return Math.floor(value);
}

/**
 * Combines the historical seed with the live Abacus value.
 * Null/negative remote values keep the seed (key missing or request failed).
 */
export function totalPageViews(seed: number, remote: number | null): number {
  if (remote === null || remote < 0) return seed;
  return seed + remote;
}

/** Formats a non-negative count for the footer (`900` → `"900"`, `1234` → `"1,234"`). */
export function formatPageViewCount(n: number): string {
  return Math.max(0, Math.floor(n)).toLocaleString("en-US");
}

/** Visible footer line, e.g. `900 views`. */
export function formatPageViewsText(pageViews: number): string {
  return `${formatPageViewCount(pageViews)} ${ABACUS_PAGE_VIEWS_SHORT_LABEL}`;
}

/** Screen-reader label, e.g. `900 page views`. */
export function formatPageViewsAria(pageViews: number): string {
  return `${formatPageViewCount(pageViews)} ${ABACUS_PAGE_VIEWS_ARIA_LABEL}`;
}

/**
 * GET the Abacus counter. Returns null on timeout, HTTP error, or a bad payload.
 */
export async function fetchAbacusValue(url: string): Promise<number | null> {
  if (url.length === 0) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ABACUS_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "omit",
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    return parseAbacusValue(body);
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export type RecordPageViewsInput = {
  hostname: string;
  request?: (url: string) => Promise<number | null>;
};

/**
 * Reads (and on production, increments) the page-view counter.
 * Every full page load counts as a new view, including repeats from the same browser.
 */
export async function recordPageViews(input: RecordPageViewsInput): Promise<number> {
  const request = input.request ?? fetchAbacusValue;
  const increment = isAbacusProductionHost(input.hostname);
  const url = composeAbacusUrl(
    increment ? ABACUS_ACTION_HIT : ABACUS_ACTION_GET,
    ABACUS_NAMESPACE,
    ABACUS_PAGE_VIEWS_KEY,
  );
  const remote = await request(url);
  return totalPageViews(ABACUS_PAGE_VIEWS_SEED, remote);
}
