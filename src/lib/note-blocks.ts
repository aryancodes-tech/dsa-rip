/**
 * Parse / serialize multi-block problem notes (prose + fenced code).
 * Storage stays a single string for {@link notesStore}.
 *
 * Legacy notes (no {@link DSA_NOTE_STRUCTURED_PREFIX}) always load as a single
 * text block so older plain-text notes are never split or lost.
 */
import {
  DSA_NOTE_DEFAULT_LANGUAGE,
  DSA_NOTE_STRUCTURED_PREFIX,
  isDsaNoteLanguageId,
  type DsaNoteLanguageId,
} from "@/constants/notes";

/** Prose paragraph in a note. */
export type NoteTextBlock = {
  type: "text";
  content: string;
};

/** Fenced code section with a language slug. */
export type NoteCodeBlock = {
  type: "code";
  language: DsaNoteLanguageId;
  content: string;
};

export type NoteBlock = NoteTextBlock | NoteCodeBlock;

/** Editor block with a stable React key (not persisted). */
export type NoteEditorBlock = NoteBlock & { id: string };

const FENCE_RE = /^```([a-zA-Z0-9_+-]*)\r?\n([\s\S]*?)^```\s*$/gm;

let noteBlockSeq = 0;

/** Allocates a unique id for an in-memory editor block. */
export function createNoteBlockId(): string {
  noteBlockSeq += 1;
  return `nb-${noteBlockSeq}`;
}

/**
 * Empty note UI: text + code so both sections are visible on first open.
 * Serializes to `""` until the user types something.
 */
export function createEmptyNoteEditorBlocks(): NoteEditorBlock[] {
  return [
    { id: createNoteBlockId(), type: "text", content: "" },
    {
      id: createNoteBlockId(),
      type: "code",
      language: DSA_NOTE_DEFAULT_LANGUAGE,
      content: "",
    },
  ];
}

/** Wraps a stored note string into editor blocks. */
export function parseNoteToEditorBlocks(raw: string): NoteEditorBlock[] {
  return parseNoteBlocks(raw).map((b) => ({ ...b, id: createNoteBlockId() }));
}

/**
 * Splits a note string into text / code blocks.
 * Without {@link DSA_NOTE_STRUCTURED_PREFIX}, the entire string is one text block (legacy).
 */
export function parseNoteBlocks(raw: string): NoteBlock[] {
  if (raw.length === 0) {
    return [
      { type: "text", content: "" },
      { type: "code", language: DSA_NOTE_DEFAULT_LANGUAGE, content: "" },
    ];
  }

  if (!raw.startsWith(DSA_NOTE_STRUCTURED_PREFIX)) {
    return [{ type: "text", content: raw }];
  }

  const body = raw.slice(DSA_NOTE_STRUCTURED_PREFIX.length);
  if (body.length === 0) {
    return [
      { type: "text", content: "" },
      { type: "code", language: DSA_NOTE_DEFAULT_LANGUAGE, content: "" },
    ];
  }

  const blocks: NoteBlock[] = [];
  let lastIndex = 0;
  FENCE_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = FENCE_RE.exec(body)) !== null) {
    const before = body.slice(lastIndex, match.index);
    pushTextIfPresent(blocks, before);
    const langRaw = match[1] ?? "";
    const language: DsaNoteLanguageId = isDsaNoteLanguageId(langRaw)
      ? langRaw
      : langRaw.length === 0
        ? DSA_NOTE_DEFAULT_LANGUAGE
        : "text";
    blocks.push({
      type: "code",
      language,
      content: stripTrailingNewline(match[2] ?? ""),
    });
    lastIndex = match.index + match[0].length;
  }

  const after = body.slice(lastIndex);
  pushTextIfPresent(blocks, after);

  if (blocks.length === 0) return [{ type: "text", content: body }];
  return blocks;
}

/**
 * Joins blocks into the stored note string.
 * - Empty → `""`
 * - Text-only (no code content) → plain text, no prefix (stays legacy-compatible)
 * - Any code content → prefixed structured markdown fences
 */
export function serializeNoteBlocks(blocks: readonly NoteBlock[]): string {
  if (blocks.length === 0) return "";

  const parts: string[] = [];
  let hasCode = false;

  for (const block of blocks) {
    if (block.type === "text") {
      if (block.content.length === 0) continue;
      parts.push(block.content);
      continue;
    }
    if (block.content.length === 0) continue;
    hasCode = true;
    const body = block.content.endsWith("\n") ? block.content : `${block.content}\n`;
    parts.push(`\`\`\`${block.language}\n${body}\`\`\``);
  }

  if (parts.length === 0) return "";
  if (!hasCode) return parts.join("\n\n");
  return `${DSA_NOTE_STRUCTURED_PREFIX}${parts.join("\n\n")}`;
}

/** True when the note has no user-visible content. */
export function isNoteBlocksEmpty(blocks: readonly NoteBlock[]): boolean {
  for (const block of blocks) {
    if (block.content.length > 0) return false;
  }
  return true;
}

function pushTextIfPresent(blocks: NoteBlock[], chunk: string): void {
  const trimmedEdges = trimFencePadding(chunk);
  if (trimmedEdges.length === 0) return;
  blocks.push({ type: "text", content: trimmedEdges });
}

/** Drop only blank lines that sit between fences; keep intentional inner spacing. */
function trimFencePadding(chunk: string): string {
  if (chunk.length === 0) return "";
  return chunk.replace(/^\n+/, "").replace(/\n+$/, "");
}

function stripTrailingNewline(s: string): string {
  if (s.length === 0) return s;
  if (s.endsWith("\r\n")) return s.slice(0, -2);
  if (s.endsWith("\n")) return s.slice(0, -1);
  return s;
}
