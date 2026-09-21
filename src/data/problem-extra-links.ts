/**
 * Precomputed optional article + YouTube URLs for sheet problems.
 *
 * Data lives in {@link ./extra-links.gen.ts} (committed generated map).
 */
import EXTRA_LINKS from "./extra-links.gen";

type ExtraLinkRow = {
  articleLink?: string;
  youtubeLink?: string;
};

type ExtraLinksFile = {
  byCoord: Record<string, ExtraLinkRow>;
  byTitle: Record<string, ExtraLinkRow>;
};

/** Collapse whitespace + lowercase for coordinate keys. */
function normalizeCoordTitle(rawTitle: string): string {
  if (rawTitle.length === 0) return "";
  return rawTitle.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Strip punctuation for title-map keys. */
function normalizeTitleKey(rawTitle: string): string {
  if (rawTitle.length === 0) return "";
  return rawTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function composeCoordKey(stepNo: number, subStepNo: number, normalizedTitle: string): string {
  return `${stepNo}|${subStepNo}|${normalizedTitle}`;
}

export type ProblemExtraLinks = {
  articleLink: string | null;
  youtubeLink: string | null;
};

const EXTRA = EXTRA_LINKS as ExtraLinksFile;

/**
 * Resolves optional article + YouTube URLs for one sheet problem.
 */
export function getProblemExtraLinks(
  stepNo: number,
  subStepNo: number,
  sheetTitle: string,
): ProblemExtraLinks {
  const byTitle = EXTRA.byTitle[normalizeTitleKey(sheetTitle)];
  const byCoord =
    EXTRA.byCoord[composeCoordKey(stepNo, subStepNo, normalizeCoordTitle(sheetTitle))];

  return {
    articleLink: byTitle?.articleLink ?? byCoord?.articleLink ?? null,
    youtubeLink: byCoord?.youtubeLink ?? byTitle?.youtubeLink ?? null,
  };
}
