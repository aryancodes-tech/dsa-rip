/**
 * Builds the client-safe extra-links map from local raw scrape inputs.
 *
 * Inputs (gitignored - local only):
 *   scripts/raw/webArchive.json
 *   scripts/raw/tuf-article-links.json
 *
 * Output (committed / shipped):
 *   src/data/extra-links.gen.ts
 *   Shape: {
 *     byCoord: { "step|sub|title": { articleLink?, youtubeLink? } },
 *     byTitle: { "normalized title": { articleLink?, youtubeLink? } }
 *   }
 *
 * Strips Wayback wrappers and drops non-YouTube / non-takeuforward hosts.
 * Unused archive fields (gfg/cs/lc/company_tags/…) are never written.
 *
 * Usage: node scripts/build-extra-links.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const ARCHIVE_PATH = path.join(root, "scripts/raw/webArchive.json");
const TUF_LINKS_PATH = path.join(root, "scripts/raw/tuf-article-links.json");
const OUT_PATH = path.join(root, "src/data/extra-links.gen.ts");

const WAYBACK_PREFIX_RE = /^https?:\/\/web\.archive\.org\/web\/[^/]+\//i;

/**
 * Strips Wayback replay prefixes and keep-lists YouTube + takeuforward.org only.
 */
function sanitizeExternalUrl(raw) {
  if (raw === null || raw === undefined) return null;
  let candidate = String(raw).trim();
  if (candidate.length === 0) return null;
  for (let guard = 0; guard < 5 && WAYBACK_PREFIX_RE.test(candidate); guard += 1) {
    candidate = candidate.replace(WAYBACK_PREFIX_RE, "").trim();
  }
  if (candidate.length === 0) return null;
  if (/^http:\/\//i.test(candidate)) candidate = `https://${candidate.slice(7)}`;
  if (!/^https:\/\//i.test(candidate)) return null;
  try {
    const host = new URL(candidate).hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("youtube.com") || host === "youtu.be") return candidate;
    if (host.includes("takeuforward.org")) return candidate;
    return null;
  } catch {
    return null;
  }
}

/** Free TUF editorials must live under /blogs/ on takeuforward.org. */
function sanitizeArticleUrl(raw) {
  const url = sanitizeExternalUrl(raw);
  if (url === null) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (!host.includes("takeuforward.org")) return null;
    if (!u.pathname.toLowerCase().includes("/blogs/")) return null;
    return url;
  } catch {
    return null;
  }
}

function sanitizeYoutubeUrl(raw) {
  const url = sanitizeExternalUrl(raw);
  if (url === null) return null;
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("youtube.com") || host === "youtu.be") return url;
    return null;
  } catch {
    return null;
  }
}

function archiveTitleKey(rawTitle) {
  return String(rawTitle || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function liveTitleKey(rawTitle) {
  return String(rawTitle || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function packLinks(articleLink, youtubeLink) {
  const row = {};
  if (articleLink) row.articleLink = articleLink;
  if (youtubeLink) row.youtubeLink = youtubeLink;
  return Object.keys(row).length > 0 ? row : null;
}

function mergeRow(into, articleLink, youtubeLink) {
  if (!into.articleLink && articleLink) into.articleLink = articleLink;
  if (!into.youtubeLink && youtubeLink) into.youtubeLink = youtubeLink;
}

if (!fs.existsSync(ARCHIVE_PATH) || !fs.existsSync(TUF_LINKS_PATH)) {
  if (fs.existsSync(OUT_PATH)) {
    console.log(
      "[build-extra-links] raw inputs missing - keeping existing src/data/extra-links.gen.ts",
    );
    process.exit(0);
  }
  console.error(
    "[build-extra-links] missing scripts/raw/{webArchive,tuf-article-links}.json and no output file",
  );
  process.exit(1);
}

const archive = JSON.parse(fs.readFileSync(ARCHIVE_PATH, "utf8"));
const tufFile = JSON.parse(fs.readFileSync(TUF_LINKS_PATH, "utf8"));

const byCoord = {};
const byTitle = {};

for (const step of archive) {
  const stepNo = step.step_no;
  for (const sub of step.sub_steps || []) {
    const subStepNo = sub.sub_step_no;
    for (const topic of sub.topics || []) {
      const title = topic.question_title;
      const articleLink = sanitizeArticleUrl(topic.post_link);
      const youtubeLink = sanitizeYoutubeUrl(topic.yt_link);
      const packed = packLinks(articleLink, youtubeLink);
      if (!packed) continue;

      const coordKey = `${stepNo}|${subStepNo}|${archiveTitleKey(title)}`;
      byCoord[coordKey] = packed;

      const tKey = liveTitleKey(title);
      if (tKey.length > 0) {
        if (!byTitle[tKey]) byTitle[tKey] = { ...packed };
        else mergeRow(byTitle[tKey], packed.articleLink, packed.youtubeLink);
      }
    }
  }
}

for (const [titleKey, row] of Object.entries(tufFile.byNormalizedTitle || {})) {
  const articleLink = sanitizeArticleUrl(row.articleLink);
  const youtubeLink = sanitizeYoutubeUrl(row.youtubeLink);
  if (!articleLink && !youtubeLink) continue;
  if (!byTitle[titleKey]) byTitle[titleKey] = {};
  mergeRow(byTitle[titleKey], articleLink, youtubeLink);
  if (!byTitle[titleKey].articleLink && !byTitle[titleKey].youtubeLink) {
    delete byTitle[titleKey];
  }
}

const out = { byCoord, byTitle };
const banner =
  "/**\n" +
  " * AUTO-GENERATED by scripts/build-extra-links.mjs - do not edit by hand.\n" +
  " * Client-safe article/YouTube map (no Wayback / scrape fields).\n" +
  " */\n" +
  "/* eslint-disable */\n";
fs.writeFileSync(
  OUT_PATH,
  `${banner}const EXTRA_LINKS = ${JSON.stringify(out)} as const;\nexport default EXTRA_LINKS;\n`,
);

const coordWithArticle = Object.values(byCoord).filter((r) => r.articleLink).length;
const titleWithArticle = Object.values(byTitle).filter((r) => r.articleLink).length;
console.log(
  JSON.stringify(
    {
      out: path.relative(root, OUT_PATH),
      byCoord: Object.keys(byCoord).length,
      byTitle: Object.keys(byTitle).length,
      coordWithArticle,
      titleWithArticle,
      bytes: fs.statSync(OUT_PATH).size,
    },
    null,
    2,
  ),
);
