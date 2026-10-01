import { describe, expect, it } from "vitest";
import {
  SHEET_SEARCH_MAX_SUGGESTIONS,
  SHEET_SEARCH_MENU_CLASS,
  SHEET_SEARCH_PLACEHOLDER,
  sheetSearchRevealDelayMs,
  sheetSearchSectionLabel,
} from "@/constants/sheet-search";

describe("sheet search copy", () => {
  it("keeps a short placeholder and a bounded suggestion list", () => {
    expect(SHEET_SEARCH_PLACEHOLDER.length).toBeGreaterThan(0);
    expect(SHEET_SEARCH_MAX_SUGGESTIONS).toBeGreaterThan(0);
    expect(SHEET_SEARCH_MENU_CLASS.length).toBeGreaterThan(0);
  });
});

describe("sheetSearchSectionLabel", () => {
  it("returns an empty string when the step title is empty", () => {
    expect(sheetSearchSectionLabel("")).toBe("");
  });

  it("keeps a step title that has no bracketed suffix", () => {
    expect(sheetSearchSectionLabel("Learn the basics")).toBe("Learn the basics");
  });

  it("drops the bracketed topic list so the parent section stays short", () => {
    expect(sheetSearchSectionLabel("Heaps [Learning, Medium + Hard]")).toBe("Heaps");
  });
});

describe("sheetSearchRevealDelayMs", () => {
  it("is shortest when both parents are already open", () => {
    expect(sheetSearchRevealDelayMs(true, true)).toBeLessThan(sheetSearchRevealDelayMs(false, false));
  });
});
