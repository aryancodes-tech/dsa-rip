// @ts-nocheck
import DSA_SHEET from "./dataSheet";
import { getProblemExtraLinks } from "./problem-extra-links";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  lcLink: string | null;
  /** Optional article URL from `extra-links.gen.ts`, when present. */
  articleLink: string | null;
  /** Optional YouTube explainer from `extra-links.gen.ts`, when present. */
  youtubeLink: string | null;
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

function flattenLinks(value: any, label: string): { label: string; url: string }[] {
  if (!value) return [];
  if (typeof value === "string") return [{ label, url: value }];
  if (typeof value === "object") {
    return Object.entries(value).map(([k, v]) => ({ label: `${label} (${k})`, url: v as string }));
  }
  return [];
}

export const SHEET: Step[] = DSA_SHEET.map((step: any) => ({
  stepNo: step.stepNo,
  stepTitle: step.stepTitle,
  subSteps: step.subSteps.map((sub: any) => ({
    subStepNo: sub.subStepNo,
    subStepTitle: sub.subStepTitle,
    problems: sub.problems.map((p: any, idx: number) => {
      const others = [
        ...flattenLinks(p.gfgLink, "GFG"),
        ...flattenLinks(p.cnLink, "Coding Ninjas"),
        ...flattenLinks(p.ibLink, "InterviewBit"),
      ];
      const extra = getProblemExtraLinks(step.stepNo, sub.subStepNo, p.title);
      return {
        id: `s${step.stepNo}-ss${sub.subStepNo}-${idx}-${p.title}`.replace(/\s+/g, "_"),
        title: p.title,
        difficulty: (p.difficulty || "Easy") as Difficulty,
        lcLink: p.lcLink || null,
        articleLink: p.articleLink ?? extra.articleLink,
        youtubeLink: p.youtubeLink ?? extra.youtubeLink,
        imageUrl: p.imageUrl ?? null,
        others,
        stepNo: step.stepNo,
        subStepNo: sub.subStepNo,
      };
    }),
  })),
}));

export const ALL_PROBLEMS: Problem[] = SHEET.flatMap((s) =>
  s.subSteps.flatMap((ss) => ss.problems)
);

/**
 * Step and sub-step titles keyed by {@link Problem.id}; used when searching sheet scope (not problem title alone).
 */
export const PROBLEM_TOPIC_LABELS_BY_ID: Record<string, { stepTitle: string; subStepTitle: string }> =
  Object.fromEntries(
    SHEET.flatMap((step) =>
      step.subSteps.flatMap((sub) =>
        sub.problems.map((p) => [
          p.id,
          { stepTitle: step.stepTitle, subStepTitle: sub.subStepTitle },
        ] as const),
      ),
    ),
  );

export const TOTAL = ALL_PROBLEMS.length;
export const TOTAL_BY_DIFF = {
  Easy: ALL_PROBLEMS.filter((p) => p.difficulty === "Easy").length,
  Medium: ALL_PROBLEMS.filter((p) => p.difficulty === "Medium").length,
  Hard: ALL_PROBLEMS.filter((p) => p.difficulty === "Hard").length,
};
