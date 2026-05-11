/**
 * Matches `http(s)://web.archive.org/web/<captureId>/…` prefixes on saved Wayback snapshots.
 *
 * Capture ids are digits optionally followed by letters (e.g. `20250304100116`).
 */
export const INTERNET_ARCHIVE_REPLAY_PREFIX_RE = /^https?:\/\/web\.archive\.org\/web\/[^/]+\//i;

/**
 * Strips Wayback replay host + capture segment so URLs open on the original site (takeuforward, YouTube, etc.).
 *
 * Returns `null` when the string is empty or the remainder is not a supported external URL shape.
 */
export function unwrapArchivedResourceUrl(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined || raw.length === 0) return null;
  let candidate = raw.trim();
  /** Strip nested replay prefixes (`…/web/…/http(s)…` may repeat in rare captures). */
  for (let guard = 0; guard < 5 && INTERNET_ARCHIVE_REPLAY_PREFIX_RE.test(candidate); guard += 1) {
    candidate = candidate.replace(INTERNET_ARCHIVE_REPLAY_PREFIX_RE, "").trim();
  }
  if (candidate.length === 0) return null;
  if (!/^https:\/\//i.test(candidate)) {
    /** Normalise legacy `http://` for YouTube / TUF outbound. */
    if (/^http:\/\//i.test(candidate)) candidate = `https://${candidate.slice(7)}`;
    else return null;
  }
  try {
    const host = new URL(candidate).hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("youtube.com")) return candidate;
    if (host === "youtu.be") return candidate;
    if (host.includes("takeuforward.org")) return candidate;
    return null;
  } catch {
    return null;
  }
}
