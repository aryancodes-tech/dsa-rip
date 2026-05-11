/**
 * Indexes TakeUForward articles + companion YouTube links from legacy Wayback-backed JSON snapshots.
 *
 * Rows are keyed by sheet coordinates + normalized title — see merged {@link SHEET} in `sheet.ts`.
 */
import ARCHIVE_SNAPSHOT_JSON from "./webArchive.json";
import { unwrapArchivedResourceUrl } from "@/constants/url-sanitize";

/** Step row from scraped archive export. */
type ArchiveSnapshotStep = {
  step_no: number;
  sub_steps: ArchiveSnapshotSub[];
};

/** Sub-step row listing `topics`. */
type ArchiveSnapshotSub = {
  sub_step_no: number;
  topics: ArchiveSnapshotTopic[];
};

/** Single archived topic/question row with optional media/article links. */
type ArchiveSnapshotTopic = {
  question_title: string;
  post_link: string | null;
  yt_link: string | null;
};

/**
 * Canonical title match key (collapses whitespace, lowercases) aligned with dsa sheet `title`.
 */
export function normalizeProblemTitleForArchiveMatch(rawTitle: string): string {
  if (rawTitle.length === 0) return "";
  return rawTitle.replace(/\s+/g, " ").trim().toLowerCase();
}

function composeArchiveLinkKey(stepNo: number, subStepNo: number, normalizedTitle: string): string {
  return `${stepNo}|${subStepNo}|${normalizedTitle}`;
}

export type ArchiveExtraLinks = {
  articleLink: string | null;
  youtubeLink: string | null;
};

function buildArchiveLinkIndex(): Map<string, ArchiveExtraLinks> {
  const map = new Map<string, ArchiveExtraLinks>();
  const steps = ARCHIVE_SNAPSHOT_JSON as ArchiveSnapshotStep[];
  for (const step of steps) {
    const stepNo = step.step_no;
    for (const sub of step.sub_steps) {
      const subStepNo = sub.sub_step_no;
      for (const topic of sub.topics) {
        const key = composeArchiveLinkKey(
          stepNo,
          subStepNo,
          normalizeProblemTitleForArchiveMatch(topic.question_title),
        );
        map.set(key, {
          articleLink: unwrapArchivedResourceUrl(topic.post_link),
          youtubeLink: unwrapArchivedResourceUrl(topic.yt_link),
        });
      }
    }
  }
  return map;
}

const ARCHIVE_LINK_INDEX = buildArchiveLinkIndex();

/**
 * Resolves sanitized article + youtube URLs merged from archive data for one sheet problem identity.
 */
export function getArchiveExtraLinksForProblem(
  stepNo: number,
  subStepNo: number,
  sheetTitle: string,
): ArchiveExtraLinks {
  const key = composeArchiveLinkKey(
    stepNo,
    subStepNo,
    normalizeProblemTitleForArchiveMatch(sheetTitle),
  );
  const links = ARCHIVE_LINK_INDEX.get(key);
  return links ?? { articleLink: null, youtubeLink: null };
}
