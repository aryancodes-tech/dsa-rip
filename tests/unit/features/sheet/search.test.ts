import { describe, expect, it } from "vitest";
import { ALL_PROBLEMS, PROBLEM_TOPIC_LABELS_BY_ID } from "@/data/sheet";
import {
  SHEET_SEARCH_ACCORDION_MS,
  SHEET_SEARCH_MAX_SUGGESTIONS,
  SHEET_SEARCH_SCROLL_SETTLE_MS,
  sheetSearchRevealDelayMs,
  sheetSearchSectionLabel,
} from "@/constants/sheet-search";
import {
  collectSearchSuggestions,
  problemMatchesSearchQuery,
  problemMatchesSuggestionQuery,
} from "@/features/sheet/lib/search";

describe("problemMatchesSearchQuery", () => {
  const problem = ALL_PROBLEMS[0];
  const labels = PROBLEM_TOPIC_LABELS_BY_ID[problem.id];

  it("matches empty query, title, step, and sub-step", () => {
    expect(problemMatchesSearchQuery(problem, "")).toBe(true);
    expect(problemMatchesSearchQuery(problem, problem.title.toLowerCase())).toBe(true);
    expect(problemMatchesSearchQuery(problem, labels.stepTitle.toLowerCase())).toBe(true);
    expect(problemMatchesSearchQuery(problem, labels.subStepTitle.toLowerCase())).toBe(true);
  });

  it("rejects unrelated queries", () => {
    expect(problemMatchesSearchQuery(problem, "zzzz-not-a-topic")).toBe(false);
  });
});

describe("collectSearchSuggestions", () => {
  const problem = ALL_PROBLEMS[0];
  const labels = PROBLEM_TOPIC_LABELS_BY_ID[problem.id];

  it("returns no rows for an empty query", () => {
    expect(collectSearchSuggestions("")).toEqual([]);
    expect(collectSearchSuggestions("   ")).toEqual([]);
    expect(problemMatchesSuggestionQuery(problem, "")).toBe(false);
  });

  it("lists a matching problem with its compact parent-step label", () => {
    const q = problem.title.slice(0, 6);
    const rows = collectSearchSuggestions(q, 8);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].problem.title.toLowerCase().includes(q.toLowerCase())).toBe(true);
    expect(rows[0].sectionLabel).toBe(sheetSearchSectionLabel(labels.stepTitle));
  });

  it("labels a heap problem with Heaps, not the Learning subsection", () => {
    const rows = collectSearchSuggestions("Heapify", 8);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].problem.title.toLowerCase().includes("heapify")).toBe(true);
    expect(rows[0].sectionLabel).toBe("Heaps");
  });

  it("caps the number of suggestions", () => {
    const rows = collectSearchSuggestions("a", 3);
    expect(rows.length).toBeLessThanOrEqual(3);
    expect(rows.length).toBeLessThanOrEqual(SHEET_SEARCH_MAX_SUGGESTIONS);
  });

  it("ranks a title prefix ahead of a subsection-only match", () => {
    const prefix = problem.title.slice(0, 4).toLowerCase();
    const rows = collectSearchSuggestions(prefix, 8);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].problem.title.toLowerCase().startsWith(prefix)).toBe(true);
  });
});

describe("sheetSearchRevealDelayMs", () => {
  it("waits longer when step and subsection still need to open", () => {
    expect(sheetSearchRevealDelayMs(true, true)).toBe(SHEET_SEARCH_SCROLL_SETTLE_MS);
    expect(sheetSearchRevealDelayMs(false, true)).toBe(
      SHEET_SEARCH_SCROLL_SETTLE_MS + SHEET_SEARCH_ACCORDION_MS,
    );
    expect(sheetSearchRevealDelayMs(false, false)).toBe(
      SHEET_SEARCH_SCROLL_SETTLE_MS + SHEET_SEARCH_ACCORDION_MS * 2,
    );
  });
});

describe("sheetSearchSectionLabel", () => {
  it("returns an empty string when the step title is empty", () => {
    expect(sheetSearchSectionLabel("")).toBe("");
  });

  it("uses the parent step title, compacting a bracketed suffix", () => {
    expect(sheetSearchSectionLabel("Heaps [Learning, Medium + Hard]")).toBe("Heaps");
  });
});
