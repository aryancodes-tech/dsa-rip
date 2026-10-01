import DSA_SHEET from "./dataSheet";
import { getProblemExtraLinks } from "./problem-extra-links";
import type { RawDifficulty, RawPlatformLink } from "./raw-sheet";

export type Difficulty = RawDifficulty;

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  lcLink: string | null;
  /** Optional article URL from `extra-links.gen.ts`, when present. */
  articleLink: string | null;
  /** Optional YouTube explainer from `extra-links.gen.ts`, when present. */
  youtubeLink: string | null;
  /** takeUforward practice URL from extra-links, when matched. */
  tufLink: string | null;
  /** Optional preview image (e.g. pattern diagram) shown beside the title in the sheet grid. */
  imageUrl: string | null;
  others: { label: string; url: string }[];
  stepNo: number;
  subStepNo: number;
}

export interface SubStep {
  subStepNo: number;
  subStepTitle: string;
  problems: Problem[];
}

export interface Step {
  stepNo: number;
  stepTitle: string;
  subSteps: SubStep[];
}

function flattenLinks(
  value: RawPlatformLink | undefined,
  label: string,
): { label: string; url: string }[] {
  if (value === null || value === undefined) return [];
  if (typeof value === "string") {
    if (value.length === 0) return [];
    return [{ label, url: value }];
  }
  return Object.entries(value)
    .filter(([, url]) => typeof url === "string" && url.length > 0)
    .map(([k, url]) => ({ label: `${label} (${k})`, url }));
}

export const SHEET: Step[] = DSA_SHEET.map((step) => ({
  stepNo: step.stepNo,
  stepTitle: step.stepTitle,
  subSteps: step.subSteps.map((sub) => ({
    subStepNo: sub.subStepNo,
    subStepTitle: sub.subStepTitle,
    problems: sub.problems.map((p, idx) => {
      const others = [
        ...flattenLinks(p.gfgLink, "GFG"),
        ...flattenLinks(p.cnLink, "Coding Ninjas"),
        ...flattenLinks(p.ibLink, "InterviewBit"),
      ];
      const extra = getProblemExtraLinks(step.stepNo, sub.subStepNo, p.title);
      return {
        id: `s${step.stepNo}-ss${sub.subStepNo}-${idx}-${p.title}`.replace(/\s+/g, "_"),
        title: p.title,
        difficulty: p.difficulty,
        lcLink: p.lcLink ?? null,
        articleLink: p.articleLink ?? extra.articleLink,
        youtubeLink: p.youtubeLink ?? extra.youtubeLink,
        tufLink: p.tufLink ?? extra.tufLink,
        imageUrl: p.imageUrl ?? null,
        others,
        stepNo: step.stepNo,
        subStepNo: sub.subStepNo,
      };
    }),
  })),
}));

export const ALL_PROBLEMS: Problem[] = SHEET.flatMap((s) =>
  s.subSteps.flatMap((ss) => ss.problems),
);

/**
 * Step and sub-step titles keyed by {@link Problem.id}; used when searching sheet scope (not problem title alone).
 */
export const PROBLEM_TOPIC_LABELS_BY_ID: Record<
  string,
  { stepTitle: string; subStepTitle: string }
> = Object.fromEntries(
  SHEET.flatMap((step) =>
    step.subSteps.flatMap((sub) =>
      sub.problems.map(
        (p) => [p.id, { stepTitle: step.stepTitle, subStepTitle: sub.subStepTitle }] as const,
      ),
    ),
  ),
);

export const TOTAL = ALL_PROBLEMS.length;
export const TOTAL_BY_DIFF = {
  Easy: ALL_PROBLEMS.filter((p) => p.difficulty === "Easy").length,
  Medium: ALL_PROBLEMS.filter((p) => p.difficulty === "Medium").length,
  Hard: ALL_PROBLEMS.filter((p) => p.difficulty === "Hard").length,
};
