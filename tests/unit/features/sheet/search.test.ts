import { describe, expect, it } from "vitest";
import { ALL_PROBLEMS, PROBLEM_TOPIC_LABELS_BY_ID } from "@/data/sheet";
import { problemMatchesSearchQuery } from "@/features/sheet/lib/search";

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
