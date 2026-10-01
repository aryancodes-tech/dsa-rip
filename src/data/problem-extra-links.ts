/**
 * Precomputed optional article, YouTube, and TUF practice URLs for sheet problems.
 *
 * Data lives in {@link ./extra-links.gen.ts} (committed generated map).
 */
import { z } from "zod";
import EXTRA_LINKS from "./extra-links.gen";

const ExtraLinkRowSchema = z
  .object({
    articleLink: z.string().min(1).optional(),
    youtubeLink: z.string().min(1).optional(),
    tufLink: z.string().min(1).optional(),
  })
  .strict();

const ExtraLinksFileSchema = z
  .object({
    byCoord: z.record(z.string(), ExtraLinkRowSchema),
    byTitle: z.record(z.string(), ExtraLinkRowSchema),
  })
  .strict();

export type ExtraLinkRow = z.infer<typeof ExtraLinkRowSchema>;
export type ExtraLinksFile = z.infer<typeof ExtraLinksFileSchema>;

/** Parses and validates the generated extra-links map. Throws if the committed file drifts. */
export function parseExtraLinksFile(input: unknown): ExtraLinksFile {
  return ExtraLinksFileSchema.parse(input);
}

/** Collapse whitespace + lowercase for coordinate keys. */
export function normalizeCoordTitle(rawTitle: string): string {
  if (rawTitle.length === 0) return "";
  return rawTitle.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Strip punctuation for title-map keys. */
export function normalizeTitleKey(rawTitle: string): string {
  if (rawTitle.length === 0) return "";
  return rawTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function composeCoordKey(
  stepNo: number,
  subStepNo: number,
  normalizedTitle: string,
): string {
  return `${stepNo}|${subStepNo}|${normalizedTitle}`;
}

export type ProblemExtraLinks = {
  articleLink: string | null;
  youtubeLink: string | null;
  tufLink: string | null;
};

const EXTRA = parseExtraLinksFile(EXTRA_LINKS);

/**
 * Resolves optional article, YouTube, and TUF practice URLs for one sheet problem.
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
    tufLink: byCoord?.tufLink ?? byTitle?.tufLink ?? null,
  };
}
