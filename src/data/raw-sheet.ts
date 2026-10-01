/**
 * Unnormalized sheet JSON shape used by {@link ./dataSheet.ts}.
 * The adapter in {@link ./sheet.ts} maps this into domain `Problem` / `Step` types.
 */

/** Platform URL, or a language-keyed map of URLs. */
export type RawPlatformLink = string | Record<string, string> | null;

export type RawDifficulty = "Easy" | "Medium" | "Hard";

export type RawProblem = {
  title: string;
  difficulty: RawDifficulty;
  lcLink?: string | null;
  gfgLink?: RawPlatformLink;
  cnLink?: RawPlatformLink;
  ibLink?: RawPlatformLink;
  imageUrl?: string | null;
  articleLink?: string | null;
  youtubeLink?: string | null;
  /** takeUforward practice URL (`/practice/dsa/{slug}`), when known. */
  tufLink?: string | null;
};

export type RawSubStep = {
  subStepNo: number;
  subStepTitle: string;
  problems: RawProblem[];
};

export type RawSheetStep = {
  stepNo: number;
  stepTitle: string;
  subSteps: RawSubStep[];
};
