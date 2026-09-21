/**
 * Indexes TakeUForward article + YouTube links for sheet problems.
 *
 * Sources (article preference order):
 * 1. Live A2Z syllabus free blogs (`tuf-article-links.json`, keyed by normalized title)
 * 2. Remapped rows in `webArchive.json` (step + sub-step + title)
 *
 * YouTube still prefers the archive snapshot, then the live title map.
 */
import ARCHIVE_SNAPSHOT_JSON from "./webArchive.json";
import TUF_ARTICLE_LINKS_JSON from "./tuf-article-links.json";
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

/** Live free-blog row keyed by normalized problem title. */
type LiveTitleLinkRow = {
  articleLink: string | null;
  youtubeLink: string | null;
  liveLabel?: string;
};

type LiveArticleLinksFile = {
  byNormalizedTitle: Record<string, LiveTitleLinkRow>;
};

/**
 * Canonical title match key (collapses whitespace, lowercases) aligned with dsa sheet `title`
 * for archive step|subStep keys.
 */
export function normalizeProblemTitleForArchiveMatch(rawTitle: string): string {
  if (rawTitle.length === 0) return "";
  return rawTitle.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Aggressive title key used by `tuf-article-links.json` (strips punctuation).
 */
export function normalizeProblemTitleForLiveLinkMatch(rawTitle: string): string {
  if (rawTitle.length === 0) return "";
  return rawTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function composeArchiveLinkKey(stepNo: number, subStepNo: number, normalizedTitle: string): string {
  return `${stepNo}|${subStepNo}|${normalizedTitle}`;
}

export type ArchiveExtraLinks = {
  articleLink: string | null;
  youtubeLink: string | null;
};

/**
 * Keeps only working free-blog URLs under `/blogs/...` (legacy category paths currently 404).
 */
function sanitizeArticleLink(raw: string | null | undefined): string | null {
  const unwrapped = unwrapArchivedResourceUrl(raw ?? null);
  if (unwrapped === null || unwrapped.length === 0) return null;
  try {
    const path = new URL(unwrapped).pathname.toLowerCase();
    if (path.includes("/blogs/")) return unwrapped;
    return null;
  } catch {
    return null;
  }
}

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
          articleLink: sanitizeArticleLink(topic.post_link),
          youtubeLink: unwrapArchivedResourceUrl(topic.yt_link),
        });
      }
    }
  }
  return map;
}

function buildLiveTitleLinkIndex(): Map<string, ArchiveExtraLinks> {
  const map = new Map<string, ArchiveExtraLinks>();
  const file = TUF_ARTICLE_LINKS_JSON as LiveArticleLinksFile;
  for (const [titleKey, row] of Object.entries(file.byNormalizedTitle ?? {})) {
    map.set(titleKey, {
      articleLink: sanitizeArticleLink(row.articleLink),
      youtubeLink: row.youtubeLink && row.youtubeLink.length > 0 ? row.youtubeLink : null,
    });
  }
  return map;
}

const ARCHIVE_LINK_INDEX = buildArchiveLinkIndex();
const LIVE_TITLE_LINK_INDEX = buildLiveTitleLinkIndex();

/**
 * Resolves sanitized article + youtube URLs for one sheet problem identity.
 *
 * Prefers live free-blog URLs by title, then archive coordinates; drops legacy TUF paths that 404.
 */
export function getArchiveExtraLinksForProblem(
  stepNo: number,
  subStepNo: number,
  sheetTitle: string,
): ArchiveExtraLinks {
  const live = LIVE_TITLE_LINK_INDEX.get(normalizeProblemTitleForLiveLinkMatch(sheetTitle));
  const key = composeArchiveLinkKey(stepNo, subStepNo, normalizeProblemTitleForArchiveMatch(sheetTitle));
  const archived = ARCHIVE_LINK_INDEX.get(key);

  return {
    articleLink: live?.articleLink ?? archived?.articleLink ?? null,
    youtubeLink: archived?.youtubeLink ?? live?.youtubeLink ?? null,
  };
}
