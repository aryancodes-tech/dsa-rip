/**
 * Optional problem-grid columns (fixed order when visible: YouTube → Article → Note → Revision → Difficulty).
 * LeetCode, GFG, and TUF are always shown - see {@link DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY}.
 */

export type OptionalSheetColumnKey = "youtube" | "article" | "note" | "revision" | "difficulty";

/** Runtime order after the problem title: YouTube, LeetCode (locked on), GFG (locked on), TUF (locked on), then these toggles in this sequence. */
export const OPTIONAL_SHEET_COLUMNS_IN_ORDER: readonly OptionalSheetColumnKey[] = [
  "youtube",
  "article",
  "note",
  "revision",
  "difficulty",
] as const;

export type OptionalSheetColumnVisibility = Record<OptionalSheetColumnKey, boolean>;

export const DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY: OptionalSheetColumnVisibility = {
  youtube: true,
  article: true,
  note: true,
  revision: true,
  difficulty: true,
};

export const OPTIONAL_SHEET_COLUMN_LABEL: Record<OptionalSheetColumnKey, string> = {
  youtube: "YouTube",
  article: "Article",
  note: "Note",
  revision: "Revision",
  difficulty: "Difficulty",
};

/**
 * Restores visibility from a 0–31 bitmask persisted in localStorage.
 */
export function optionalColumnMaskToVisibility(mask: number): OptionalSheetColumnVisibility {
  if (!Number.isFinite(mask)) return { ...DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY };
  const m = mask & 31;
  return {
    youtube: !!(m & 1),
    article: !!(m & 2),
    note: !!(m & 4),
    revision: !!(m & 8),
    difficulty: !!(m & 16),
  };
}

/** Serializes {@link OptionalSheetColumnVisibility} to a small integer for storage. */
export function visibilityToOptionalColumnMask(vis: OptionalSheetColumnVisibility): number {
  let n = 0;
  if (vis.youtube) n |= 1;
  if (vis.article) n |= 2;
  if (vis.note) n |= 4;
  if (vis.revision) n |= 8;
  if (vis.difficulty) n |= 16;
  return n;
}

/** Locked (always-on) platform column header after LeetCode. */
export const SHEET_GFG_COLUMN_LABEL = "GFG";

/** Locked (always-on) takeUforward practice column header after GFG. */
export const SHEET_TUF_COLUMN_LABEL = "TUF";

/** Accessible name for the TUF practice icon link. */
export const SHEET_TUF_LINK_ARIA_LABEL = "Open on takeUforward";

/**
 * `sm` grid: status (1) + LeetCode (1) + GFG (1) + TUF (1) + each optional 1 col, difficulty 2 cols.
 */
export function computeProblemTitleColSpanSm(vis: OptionalSheetColumnVisibility): number {
  let used = 1 + 1 + 1 + 1;
  if (vis.youtube) used += 1;
  if (vis.article) used += 1;
  if (vis.note) used += 1;
  if (vis.revision) used += 1;
  if (vis.difficulty) used += 2;
  return Math.max(2, 12 - used);
}

/** Tailwind `col-span-*` for title cell (avoid dynamic template strings - JIT sees full class names). */
const TITLE_COL_SPAN_CLASS: Record<number, string> = {
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
};

/**
 * Problem title column classes for the sheet grid (same on mobile + desktop; narrow viewports scroll horizontally).
 */
export function problemTitleGridClassName(titleColSpanSm: number): string {
  const span = TITLE_COL_SPAN_CLASS[titleColSpanSm] ?? "col-span-4";
  return `text-sm font-normal leading-snug ${span}`;
}
