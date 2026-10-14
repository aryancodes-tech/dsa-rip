import { describe, expect, it } from "vitest";
import { DSA_NOTE_DEFAULT_LANGUAGE, DSA_NOTE_STRUCTURED_PREFIX } from "@/constants/notes";
import {
  createEmptyNoteEditorBlocks,
  isNoteBlocksEmpty,
  parseNoteBlocks,
  serializeNoteBlocks,
} from "@/lib/note-blocks";

describe("note-blocks", () => {
  it("treats legacy plain notes (no prefix) as a single text block", () => {
    expect(parseNoteBlocks("two pointers")).toEqual([{ type: "text", content: "two pointers" }]);
    expect(parseNoteBlocks("see ```fake``` fence")).toEqual([
      { type: "text", content: "see ```fake``` fence" },
    ]);
  });

  it("opens empty notes with both text and code sections", () => {
    const empty = createEmptyNoteEditorBlocks();
    expect(empty).toHaveLength(2);
    expect(empty[0]?.type).toBe("text");
    expect(empty[1]?.type).toBe("code");
    expect(serializeNoteBlocks(empty)).toBe("");
    expect(parseNoteBlocks("")).toEqual([
      { type: "text", content: "" },
      { type: "code", language: DSA_NOTE_DEFAULT_LANGUAGE, content: "" },
    ]);
  });

  it("round-trips structured text and fenced code with the version prefix", () => {
    const blocks = [
      { type: "text" as const, content: "Approach: reverse in place" },
      { type: "code" as const, language: "go" as const, content: "func reverse(s []byte) {}" },
      { type: "code" as const, language: "python" as const, content: "def reverse(s):\n    pass" },
    ];
    const raw = serializeNoteBlocks(blocks);
    expect(raw.startsWith(DSA_NOTE_STRUCTURED_PREFIX)).toBe(true);
    expect(raw).toContain("```go\n");
    expect(raw).toContain("```python\n");
    expect(parseNoteBlocks(raw)).toEqual(blocks);
  });

  it("keeps text-only notes unprefixed so they stay legacy-shaped", () => {
    const raw = serializeNoteBlocks([{ type: "text", content: "O(n) two pointers" }]);
    expect(raw).toBe("O(n) two pointers");
    expect(raw.startsWith(DSA_NOTE_STRUCTURED_PREFIX)).toBe(false);
  });

  it("serializes empty blocks to an empty string", () => {
    expect(serializeNoteBlocks([{ type: "text", content: "" }])).toBe("");
    expect(isNoteBlocksEmpty([{ type: "text", content: "" }])).toBe(true);
    expect(isNoteBlocksEmpty([{ type: "code", language: "cpp", content: "x" }])).toBe(false);
  });

  it("falls back unknown fence languages to plain text when structured", () => {
    const blocks = parseNoteBlocks(`${DSA_NOTE_STRUCTURED_PREFIX}\`\`\`weirdlang\nprint(1)\n\`\`\``);
    expect(blocks).toEqual([{ type: "code", language: "text", content: "print(1)" }]);
  });
});
