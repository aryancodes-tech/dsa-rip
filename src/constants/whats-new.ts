import { isTourCompleted } from "@/constants/tour";

/**
 * Post-splash changelog for returning visitors who already finished the tour.
 * Bump {@link DSA_WHATS_NEW_VERSION} when the copy changes so they see it again.
 */

/** Stored when the visitor dismisses this changelog. Must be non-empty. */
export const DSA_WHATS_NEW_VERSION = "2026-10-14-notes-preview";

/** ISO date shown as the release heading. */
export const DSA_WHATS_NEW_RELEASE_DATE = "2026-10-14";

/** Dialog heading. */
export const DSA_WHATS_NEW_TITLE = "Release notes";

/** One-line lead under the title. */
export const DSA_WHATS_NEW_INTRO = "Notable changes to the sheet.";

/** Primary dismiss control. */
export const DSA_WHATS_NEW_CTA = "Continue";

/** Full-width dismiss button classes. */
export const DSA_WHATS_NEW_CTA_CLASS =
  "cursor-pointer inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 touch-manipulation";

/**
 * Dialog shell — uses most of the viewport so the live Notes preview,
 * changelog, and Continue control fit without feeling clipped.
 */
export const DSA_WHATS_NEW_DIALOG_CLASS =
  "flex max-h-[min(94vh,52rem)] w-[min(94vw,48rem)] max-w-[min(94vw,48rem)] flex-col gap-3 overflow-y-auto rounded-2xl border-border bg-card p-5 shadow-xl sm:gap-4 sm:p-6 sm:w-[min(94vw,52rem)] sm:max-w-[min(94vw,52rem)] sm:rounded-2xl";

/** Scrollable middle (preview + bullets) when the viewport is short. */
export const DSA_WHATS_NEW_BODY_CLASS = "min-h-0 flex-1 space-y-3 overflow-y-auto sm:space-y-4";

/** Changelog list - extra leading so wrapped lines do not collide. */
export const DSA_WHATS_NEW_LIST_CLASS =
  "space-y-2.5 text-[0.9375rem] leading-[1.65] text-foreground/80";

/** Inline `code` chip - Keep-a-Changelog highlight. */
export const DSA_WHATS_NEW_CODE_CLASS =
  "rounded-[0.2rem] bg-rose-100 px-1.5 py-0.5 font-mono text-[0.75rem] font-medium text-rose-800 dark:bg-rose-500/15 dark:text-rose-300 lavender:bg-violet-200/80 lavender:text-violet-800";

/** Frame around the live Notes editor preview. */
export const DSA_WHATS_NEW_NOTES_PREVIEW_FRAME_CLASS =
  "w-full rounded-xl border border-border bg-muted/30 p-3";

/** Sample problem title shown in the Notes preview. */
export const DSA_WHATS_NEW_NOTES_PREVIEW_PROBLEM_TITLE = "Reverse a String II";

/** Sample prose block content for the Notes preview. */
export const DSA_WHATS_NEW_NOTES_PREVIEW_TEXT =
  "Time Complexity: O(N)\nSpace Complexity: O(N)";

/** Sample code language for the Notes preview. */
export const DSA_WHATS_NEW_NOTES_PREVIEW_LANGUAGE = "go" as const;

/** Sample solution shown in the Notes preview code block. */
export const DSA_WHATS_NEW_NOTES_PREVIEW_CODE = `func reverseFunc(s []byte, x, lengthStr int) {
    if x >= lengthStr {
        return
    }
    reverseFunc(s, x+1, lengthStr)
    if x < (lengthStr)/2 {
        s[x], s[lengthStr-x-1] = s[lengthStr-x-1], s[x]
    }
}`;

/** One glanceable line. Wrap tokens in backticks to render as code chips. */
export type WhatsNewItem = {
  /** Short line the visitor can scan. Backticks mark inline code. */
  line: string;
};

/** User-facing changes in this note, in reading order. */
export const DSA_WHATS_NEW_ITEMS: readonly WhatsNewItem[] = [
  { line: "Larger `Notes` editor - room to write approaches and solutions" },
  { line: "Pick a language per code block (`C++`, `Java`, `Python`, `Go`, and more)" },
  { line: "Syntax highlighting that follows the selected language" },
] as const;

/** One run of a changelog line after splitting on backticks. */
export type WhatsNewLinePart = {
  /** True when this run is an inline code token. */
  code: boolean;
  /** Visible text. */
  text: string;
};

/**
 * Release heading - the date only.
 */
export function formatWhatsNewReleaseHeading(
  date: string = DSA_WHATS_NEW_RELEASE_DATE,
): string {
  if (date.length === 0) return "";
  return date;
}

/**
 * Splits a changelog line on backticks into text and inline-code parts.
 */
export function splitWhatsNewLine(line: string): WhatsNewLinePart[] {
  if (line.length === 0) return [];
  const parts: WhatsNewLinePart[] = [];
  const chunks = line.split("`");
  for (let i = 0; i < chunks.length; i++) {
    const text = chunks[i];
    if (text.length === 0) continue;
    parts.push({ code: i % 2 === 1, text });
  }
  return parts;
}

/**
 * True when `stored` is this changelog’s id (the visitor already dismissed it).
 */
export function hasSeenWhatsNew(
  stored: string | null,
  version: string = DSA_WHATS_NEW_VERSION,
): boolean {
  if (version.length === 0) return true;
  if (stored === null || stored.length === 0) return false;
  return stored === version;
}

/**
 * Returning visitors who finished the tour and have not dismissed this note.
 * New visitors skip it - they have not seen the old sheet.
 */
export function shouldOfferWhatsNew(
  whatsNewStored: string | null,
  tourDoneStored: string | null,
  version: string = DSA_WHATS_NEW_VERSION,
): boolean {
  if (!isTourCompleted(tourDoneStored)) return false;
  return !hasSeenWhatsNew(whatsNewStored, version);
}
