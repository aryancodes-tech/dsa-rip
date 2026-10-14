import { describe, expect, it } from "vitest";
import {
  DSA_NOTE_DEFAULT_LANGUAGE,
  DSA_NOTE_LANGUAGES,
  DSA_NOTE_MAX_CHARS,
  DSA_NOTE_SHEET_CHAR_BUDGET,
  isDsaNoteLanguageId,
} from "@/constants/notes";
import { TOTAL } from "@/data/sheet";

describe("notes constants", () => {
  it("keeps a usable per-note budget that still fits a full-sheet fill", () => {
    expect(DSA_NOTE_MAX_CHARS).toBeGreaterThanOrEqual(3000);
    expect(TOTAL * DSA_NOTE_MAX_CHARS).toBeLessThanOrEqual(DSA_NOTE_SHEET_CHAR_BUDGET);
  });

  it("lists known languages including the default", () => {
    expect(DSA_NOTE_LANGUAGES.some((l) => l.id === DSA_NOTE_DEFAULT_LANGUAGE)).toBe(true);
    expect(isDsaNoteLanguageId("go")).toBe(true);
    expect(isDsaNoteLanguageId("")).toBe(false);
    expect(isDsaNoteLanguageId("cobol")).toBe(false);
  });
});
