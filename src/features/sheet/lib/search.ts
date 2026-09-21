import { PROBLEM_TOPIC_LABELS_BY_ID, type Problem } from "@/data/sheet";

/**
 * True when `qLower` matches the problem title, parent step title, or parent sub-step title
 * (`qLower` already trimmed lowercased).
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
