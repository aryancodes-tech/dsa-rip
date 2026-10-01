import { ALL_PROBLEMS, PROBLEM_TOPIC_LABELS_BY_ID, type Problem } from "@/data/sheet";
import { SHEET_SEARCH_MAX_SUGGESTIONS, sheetSearchSectionLabel } from "@/constants/sheet-search";

/**
 * One combobox row: the problem to jump to plus its compact parent-step label.
 */
export type SheetSearchSuggestion = {
  problem: Problem;
  sectionLabel: string;
};

/**
 * True when `qLower` matches the problem title, parent step title, or parent sub-step title
 * (`qLower` already trimmed lowercased). Empty query matches every problem (legacy sheet filter).
 */
export function problemMatchesSearchQuery(problem: Problem, qLower: string): boolean {
  if (qLower.length === 0) return true;
  if (problem.title.toLowerCase().includes(qLower)) return true;
  const labels = PROBLEM_TOPIC_LABELS_BY_ID[problem.id];
  if (labels === undefined) return false;
  if (labels.stepTitle.toLowerCase().includes(qLower)) return true;
  if (labels.subStepTitle.toLowerCase().includes(qLower)) return true;
  return false;
}

/**
 * True when a non-empty query should list this problem as a jump suggestion.
 * Matches title or subsection name, not the whole step title (too broad).
 */
export function problemMatchesSuggestionQuery(problem: Problem, qLower: string): boolean {
  if (qLower.length === 0) return false;
  if (problem.title.toLowerCase().includes(qLower)) return true;
  const labels = PROBLEM_TOPIC_LABELS_BY_ID[problem.id];
  if (labels === undefined) return false;
  return labels.subStepTitle.toLowerCase().includes(qLower);
}

/**
 * Lower is better. Title prefix beats title substring, then subsection prefix / substring.
 */
export function searchSuggestionRank(problem: Problem, qLower: string): number {
  const title = problem.title.toLowerCase();
  if (title.startsWith(qLower)) return 0;
  if (title.includes(qLower)) return 1;
  const labels = PROBLEM_TOPIC_LABELS_BY_ID[problem.id];
  const sub = labels === undefined ? "" : labels.subStepTitle.toLowerCase();
  if (sub.startsWith(qLower)) return 2;
  if (sub.includes(qLower)) return 3;
  return 99;
}

/**
 * Ranked problem suggestions for the search combobox.
 * Empty or whitespace-only queries return no rows (the sheet is not filtered).
 */
export function collectSearchSuggestions(
  query: string,
  limit: number = SHEET_SEARCH_MAX_SUGGESTIONS,
): SheetSearchSuggestion[] {
  const qLower = query.trim().toLowerCase();
  if (qLower.length === 0 || limit <= 0) return [];

  const scored: { problem: Problem; rank: number; index: number }[] = [];
  for (let index = 0; index < ALL_PROBLEMS.length; index += 1) {
    const problem = ALL_PROBLEMS[index];
    if (!problemMatchesSuggestionQuery(problem, qLower)) continue;
    scored.push({ problem, rank: searchSuggestionRank(problem, qLower), index });
  }
  scored.sort((a, b) => a.rank - b.rank || a.index - b.index);

  const cap = Math.min(limit, scored.length);
  const out: SheetSearchSuggestion[] = [];
  for (let i = 0; i < cap; i += 1) {
    const problem = scored[i].problem;
    const labels = PROBLEM_TOPIC_LABELS_BY_ID[problem.id];
    const stepTitle = labels === undefined ? "" : labels.stepTitle;
    out.push({
      problem,
      sectionLabel: sheetSearchSectionLabel(stepTitle),
    });
  }
  return out;
}
