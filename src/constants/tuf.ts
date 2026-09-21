/**
 * TakeUForward (Striver) site origins and path conventions used for article/blog links.
 */

/** Public site origin for free blog editorials. */
export const TUF_SITE_ORIGIN = "https://takeuforward.org";

/**
 * Path prefix for free DSA editorials after the 2025/2026 site redesign.
 * Older posts lived under category paths like `/data-structure/...` or `/arrays/...`.
 */
export const TUF_FREE_BLOG_PATH_PREFIX = "/blogs/data-structure-and-algorithm";

/** Absolute URL prefix for free blog editorials. */
export const TUF_FREE_BLOG_ORIGIN_PREFIX = `${TUF_SITE_ORIGIN}${TUF_FREE_BLOG_PATH_PREFIX}`;

/**
 * Builds an absolute free-blog URL from a relative `/blogs/...` path or a bare slug.
 */
export function buildTufFreeBlogUrl(relativeOrSlug: string): string | null {
  if (relativeOrSlug.length === 0) return null;
  const trimmed = relativeOrSlug.trim();
  if (trimmed.length === 0) return null;
  if (/^https:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${TUF_SITE_ORIGIN}${trimmed}`;
  return `${TUF_FREE_BLOG_ORIGIN_PREFIX}/${trimmed.replace(/^\/+/, "")}`;
}
