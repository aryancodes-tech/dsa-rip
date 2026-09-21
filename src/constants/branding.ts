import type { ResolvedTheme } from "@/constants/theme";

/**
 * Google Fonts stylesheet for the UI body/display family (loaded from document head; not via CSS `@import`
 * so PostCSS does not require it before Tailwind’s expanded output).
 */
export const POPPINS_GOOGLE_FONTS_STYLESHEET_HREF =
  "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,500&display=swap";

/**
 * Static asset paths under `public/logos/` (Vite serves `public/` at `/`).
 */
export const LOGO_LEETCODE_LIGHT_PATH = "/logos/leetcode_light_mode.png";

export const LOGO_LEETCODE_DARK_PATH = "/logos/leetcode_dark_mode.png";

export const LOGO_GEEKSFORGEEKS_PATH = "/logos/geeksforgeeks.png";

export const LOGO_YOUTUBE_PATH = "/logos/youtube.png";

/** Compact product lockup for the header (tombstone + dsa.rip wordmark). */
export const LOGO_DSA_RIP_PATH = "/logos/dsa-rip-logo.jpg";

/** Full-bleed splash lockup (tombstone + dsa.rip wordmark, transparent PNG). */
export const LOGO_DSA_RIP_SPLASH_PATH = "/logos/dsa-rip-logo-splash.png";

/** Header brand image classes (full lockup; pair with a visually hidden product name). */
export const LOGO_DSA_RIP_HEADER_CLASS =
  "h-14 w-auto shrink-0 rounded-lg object-contain sm:h-16";

/** Splash hero image classes (square lockup). */
export const LOGO_DSA_RIP_SPLASH_CLASS =
  "h-56 w-auto max-w-[min(20rem,85vw)] object-contain sm:h-72";

/**
 * Which LeetCode raster to show for the resolved tracker theme.
 * Lavender uses the light artwork (lavender shell is a light palette).
 */
export function leetCodeLogoPublicPath(theme: ResolvedTheme): string {
  if (theme === "dark") return LOGO_LEETCODE_DARK_PATH;
  return LOGO_LEETCODE_LIGHT_PATH;
}

/** Square edge length (px) for LC / GFG raster logos in the problem grid (~10% under the prior 32px size). */
export const SHEET_PLATFORM_LOGO_PX = 29;

/** Lucide “other” fallback (e.g. Globe) - intentionally smaller than {@link SHEET_PLATFORM_LOGO_PX}. */
export const SHEET_FALLBACK_ICON_PX = 22;

/**
 * Shared link chrome for YouTube / LeetCode / “other” platform cells in the sheet grid (`p-1` vs older `p-2`
 * to keep vertical padding around rasters low).
 */
export const SHEET_PLATFORM_ICON_LINK_BASE_CLASSES =
  "cursor-pointer inline-flex items-center justify-center rounded-md p-1 hover:bg-muted";

/**
 * Shortener hosts where the final destination is opaque - we infer GFG from {@link resourceLabelMatchesGfg}.
 */
const GFG_AMBIGUOUS_SHORTENER_HOSTS: ReadonlySet<string> = new Set([
  "bit.ly",
  "www.bit.ly",
  "bitly.com",
  "www.bitly.com",
  "j.mp",
  "www.j.mp",
]);

/**
 * Normalizes hostname for {@link GFG_AMBIGUOUS_SHORTENER_HOSTS} and `*.bit.ly`-style hosts.
 */
function isBitlyOrRelatedShortener(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (GFG_AMBIGUOUS_SHORTENER_HOSTS.has(h)) return true;
  return h.endsWith(".bit.ly");
}

/**
 * True when the sheet label marks this row as coming from GeeksforGeeks (e.g. `"GFG"`, `"GFG (Easy)"`).
 */
function resourceLabelMatchesGfg(label: string): boolean {
  if (label.length === 0) return false;
  const lower = label.toLowerCase();
  if (lower.includes("gfg")) return true;
  if (lower.includes("geeksforgeeks")) return true;
  if (lower.includes("geeks for geeks")) return true;
  return false;
}

/**
 * Returns true when the URL host is GeeksforGeeks (direct or www/practice subdomain).
 */
function isDirectGeeksforGeeksUrl(url: string): boolean {
  if (url.length === 0) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes("geeksforgeeks.org") || host.includes("geeksforgeeks.com");
  } catch {
    return url.toLowerCase().includes("geeksforgeeks");
  }
}

/**
 * Use for grid UI: shows the GFG logo for direct GFG URLs and for ambiguous shorteners (e.g. bit.ly)
 * when `label` indicates the resource is from GeeksforGeeks.
 */
export function isGeeksforGeeksResource(link: { url: string; label: string }): boolean {
  if (link.url.length === 0) return false;
  if (isDirectGeeksforGeeksUrl(link.url)) return true;
  if (link.label.length === 0) return false;
  try {
    const host = new URL(link.url).hostname.toLowerCase();
    if (isBitlyOrRelatedShortener(host) && resourceLabelMatchesGfg(link.label)) return true;
  } catch {
    /* malformed URL → not handled as shortener */
  }
  return false;
}

/**
 * Picks the single “other resource” link shown in the grid (first entry).
 */
export function getPrimaryOtherLink(others: { label: string; url: string }[]): { label: string; url: string } | null {
  if (others.length === 0) return null;
  return others[0];
}
