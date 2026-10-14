/**
 * Notes modal copy, languages, and size limits for per-problem approach / code notes.
 */

/**
 * Conservative planning budget for *all* problem notes combined (character
 * count before JSON escaping). Assumes a ~5 MiB origin quota with UTF-16
 * localStorage accounting (~2.5 M code units) and leaves headroom for
 * `dsa.done` / `dsa.rev` / prefs plus JSON overhead.
 */
export const DSA_NOTE_SHEET_CHAR_BUDGET = 2_250_000;

/**
 * Max characters per problem note (serialized text + fenced code).
 * Sized so `DSA_NOTE_MAX_CHARS × ~550 sheet problems` stays under
 * {@link DSA_NOTE_SHEET_CHAR_BUDGET} even if every problem has a full note.
 * Filling every note to the max is still a stress case - typical use is fine.
 */
export const DSA_NOTE_MAX_CHARS = 4000;

/** Debounce before writing a note into localStorage. */
export const DSA_NOTE_AUTOSAVE_MS = 300;

/** Warn in the footer when this many characters remain. */
export const DSA_NOTE_NEAR_LIMIT_CHARS = 200;

/** Spaces inserted when Tab is pressed inside a code block. */
export const DSA_NOTE_CODE_TAB_SPACES = 2;

/** Modal shell width / height for a usable editor surface. */
export const DSA_NOTE_MODAL_CLASS =
  "flex w-full max-w-4xl flex-col rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6 h-[min(92vh,44rem)]";

/** Scrollable block list inside the modal. */
export const DSA_NOTE_BLOCKS_SCROLL_CLASS =
  "min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-0.5";

/** Min height for a text (prose) block. */
export const DSA_NOTE_TEXT_MIN_H_CLASS = "min-h-28";

/** Min height for a code block textarea. */
export const DSA_NOTE_CODE_MIN_H_CLASS = "min-h-44";

/** Placeholder for empty prose blocks. */
export const DSA_NOTE_TEXT_PLACEHOLDER = "Approach, complexity, tricks…";

/** Placeholder for empty code blocks. */
export const DSA_NOTE_CODE_PLACEHOLDER = "Paste or write your solution…";

/** Footer hint under the editor. */
export const DSA_NOTE_AUTOSAVE_HINT = "Auto-saved locally in this browser.";

/** Accessible label for the language select on a code block. */
export const DSA_NOTE_LANGUAGE_LABEL = "Language";

/** Button: append a prose block. */
export const DSA_NOTE_ADD_TEXT_LABEL = "Add text";

/** Button: append a code block. */
export const DSA_NOTE_ADD_CODE_LABEL = "Add code";

/** Button: copy one code block to the clipboard. */
export const DSA_NOTE_COPY_LABEL = "Copy";

/** Brief confirmation after a successful copy. */
export const DSA_NOTE_COPIED_LABEL = "Copied";

/** Button: remove a block. */
export const DSA_NOTE_REMOVE_LABEL = "Remove";

/** Supported code-block languages (slug → label). Order is select order. */
export const DSA_NOTE_LANGUAGES = [
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "c", label: "C" },
  { id: "rust", label: "Rust" },
  { id: "kotlin", label: "Kotlin" },
  { id: "text", label: "Plain text" },
] as const;

/** Default language for a newly added code block. */
export const DSA_NOTE_DEFAULT_LANGUAGE = "cpp";

/**
 * Marker written at the start of structured (text + fenced code) notes.
 * Notes without this prefix are treated as legacy plain text → one text block,
 * so older saved notes never lose content to accidental fence parsing.
 */
export const DSA_NOTE_STRUCTURED_PREFIX = "<!--dsa-note:v1-->\n";

/** CSS class on the highlighted code overlay (paired with styles in `styles.css`). */
export const DSA_NOTE_CODE_HIGHLIGHT_CLASS = "note-code-highlight";

export type DsaNoteLanguageId = (typeof DSA_NOTE_LANGUAGES)[number]["id"];

const LANGUAGE_ID_SET = new Set<string>(DSA_NOTE_LANGUAGES.map((l) => l.id));

/** True when `id` is a known notes language slug. */
export function isDsaNoteLanguageId(id: string): id is DsaNoteLanguageId {
  if (id.length === 0) return false;
  return LANGUAGE_ID_SET.has(id);
}
