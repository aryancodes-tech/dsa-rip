/**
 * Site-wide SEO / AEO / GEO signals for dsa.rip.
 * Keep absolute URLs and SERP copy here - do not hardcode them in route JSX.
 */

import {
  CREATOR_DISPLAY_NAME,
  CREATOR_PORTFOLIO_URL,
  CREATOR_TWITTER_HANDLE,
  CREATOR_TWITTER_URL,
  DSA_LEETCODE_LINKS_PITCH,
  DSA_LEETCODE_LINKS_PITCH_SHORT,
  DSA_PRODUCT_DISPLAY_NAME,
} from "@/constants/creator";
import { SHEET, TOTAL, TOTAL_BY_DIFF } from "@/data/sheet";

/** Canonical production origin (no trailing slash). */
export const DSA_SITE_ORIGIN = "https://dsa.rip";

/** Home / app path. */
export const DSA_SITE_PATH = "/";

/** Absolute canonical URL for the tracker home page. */
export const DSA_CANONICAL_URL = `${DSA_SITE_ORIGIN}${DSA_SITE_PATH}`;

/**
 * Social share card under `public/og-twitter.png` (landscape OG / Twitter large image).
 */
export const DSA_OG_IMAGE_PATH = "/og-twitter.png";

export const DSA_OG_IMAGE_URL = `${DSA_SITE_ORIGIN}${DSA_OG_IMAGE_PATH}`;

/** OG image pixel size for `og:image:width` / `og:image:height`. */
export const DSA_OG_IMAGE_WIDTH = 1672;

export const DSA_OG_IMAGE_HEIGHT = 941;

/** Short alt text for social preview images. */
export const DSA_OG_IMAGE_ALT = `${DSA_PRODUCT_DISPLAY_NAME} - Practice DSA with curated LeetCode and GeeksforGeeks problems`;

/**
 * Primary SERP title (~50–60 chars). Keyword-led; brand at the end.
 */
export const DSA_SEO_TITLE =
  "A2Z DSA Sheet with Public LeetCode Links | dsa.rip";

/** Fallback / root title when a child route does not override. */
export const DSA_SEO_TITLE_SHORT = `${DSA_PRODUCT_DISPLAY_NAME} - A2Z sheet, public LeetCode links`;

/**
 * Meta description (~150–160 chars) with primary keywords + value prop + CTA.
 */
export const DSA_SEO_DESCRIPTION = `${DSA_LEETCODE_LINKS_PITCH_SHORT} Track solved, revision & notes across ${TOTAL} problems. Free, local, no account.`;

/** Open Graph description (can be slightly shorter / punchier). */
export const DSA_OG_DESCRIPTION = `${DSA_LEETCODE_LINKS_PITCH_SHORT} Mark solved, revise, take notes - progress stays in this browser.`;

/** Comma-separated keywords meta (weak signal; still useful for Bing / some crawlers). */
export const DSA_SEO_KEYWORDS = [
  "A2Z DSA sheet LeetCode links",
  "Striver A2Z LeetCode",
  "public LeetCode links A2Z",
  "DSA tracker",
  "A2Z DSA sheet",
  "Striver A2Z",
  "DSA sheet progress",
  "LeetCode tracker",
  "data structures and algorithms",
  "coding interview prep",
  "revision tracker",
  "local DSA progress",
  "dsa.rip",
].join(", ");

/** Theme color for browser chrome (matches light brand surface). */
export const DSA_THEME_COLOR = "#f5f0e8";

/** Application name for PWA / install prompts. */
export const DSA_APP_NAME = DSA_PRODUCT_DISPLAY_NAME;

/** One-line app summary for web manifest / PWA install prompts. */
export const DSA_APP_SHORT_DESCRIPTION =
  "A2Z DSA sheet tracker with public LeetCode links - solved, revision, notes.";

/**
 * FAQ pairs for FAQPage JSON-LD and on-page AEO content.
 * Answers are written for AI Overviews / citation engines (plain, factual).
 */
export const DSA_SEO_FAQS: ReadonlyArray<{ question: string; answer: string }> = [
  {
    question: "What is dsa.rip?",
    answer: `${DSA_PRODUCT_DISPLAY_NAME} is a free, local-first tracker for the Striver A2Z DSA sheet. ${DSA_LEETCODE_LINKS_PITCH} You also mark problems solved, star them for revision, and save notes - all in your browser, with no account.`,
  },
  {
    question: "Does dsa.rip show LeetCode links openly?",
    answer: `Yes. ${DSA_LEETCODE_LINKS_PITCH} Where a problem has a LeetCode URL, you can open it in one click from the sheet grid.`,
  },
  {
    question: "How many DSA problems are on the A2Z sheet in dsa.rip?",
    answer: `The tracker includes ${TOTAL} problems across Easy (${TOTAL_BY_DIFF.Easy}), Medium (${TOTAL_BY_DIFF.Medium}), and Hard (${TOTAL_BY_DIFF.Hard}), organized into topic steps with LeetCode and other practice resources when available.`,
  },
  {
    question: "Is my DSA progress saved to a server?",
    answer:
      "No. Solved status, revision stars, and notes stay in this browser’s localStorage only. Nothing is uploaded; clearing site data or switching browsers resets progress unless you export it yourself.",
  },
  {
    question: "Do I need an account to use the DSA sheet tracker?",
    answer:
      "No account is required. Open dsa.rip and start tracking immediately. Your progress never leaves the device you are using.",
  },
  {
    question: "What can I track on each DSA problem?",
    answer:
      "You can mark a problem solved, star it for revision, attach a personal note, and open linked practice resources such as LeetCode, articles, and YouTube explainers when available.",
  },
];

/** Topic step titles for crawlable ItemList / on-page outline. */
export const DSA_SEO_TOPIC_STEPS: ReadonlyArray<{ stepNo: number; title: string }> =
  SHEET.map((s) => ({ stepNo: s.stepNo, title: s.stepTitle }));

/**
 * Builds absolute asset URL under the canonical origin.
 */
export function dsaAbsoluteUrl(path: string): string {
  if (path.length === 0) return DSA_SITE_ORIGIN;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${DSA_SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * WebSite + WebApplication JSON-LD for entity understanding (Google + AI crawlers).
 */
export function buildDsaWebApplicationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["WebSite", "WebApplication"],
    "@id": `${DSA_CANONICAL_URL}#app`,
    name: DSA_PRODUCT_DISPLAY_NAME,
    alternateName: [
      "DSA rip",
      "DSA A2Z Tracker",
      "A2Z sheet with public LeetCode links",
      "Local DSA sheet tracker",
    ],
    url: DSA_CANONICAL_URL,
    description: DSA_SEO_DESCRIPTION,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Coding interview preparation",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and a modern browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Striver A2Z DSA sheet progress tracking",
      "Public LeetCode links in an always-on sheet column",
      "Mark problems solved",
      "Revision starring",
      "Per-problem notes",
      "Difficulty filters and search",
      "Local-only storage (no account)",
    ],
    creator: {
      "@type": "Person",
      name: CREATOR_DISPLAY_NAME,
      url: CREATOR_PORTFOLIO_URL,
      sameAs: [CREATOR_TWITTER_URL],
    },
    author: {
      "@type": "Person",
      name: CREATOR_DISPLAY_NAME,
      url: CREATOR_PORTFOLIO_URL,
      sameAs: [CREATOR_TWITTER_URL],
    },
    image: DSA_OG_IMAGE_URL,
    screenshot: DSA_OG_IMAGE_URL,
    inLanguage: "en",
    isAccessibleForFree: true,
    keywords: DSA_SEO_KEYWORDS,
  };
}

/**
 * FAQPage JSON-LD for rich results and AI answer engines.
 */
export function buildDsaFaqPageJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${DSA_CANONICAL_URL}#faq`,
    mainEntity: DSA_SEO_FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * ItemList of A2Z topic steps so crawlers see the sheet outline in structured data.
 */
export function buildDsaTopicListJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${DSA_CANONICAL_URL}#topics`,
    name: "A2Z DSA sheet topics on dsa.rip",
    numberOfItems: DSA_SEO_TOPIC_STEPS.length,
    itemListElement: DSA_SEO_TOPIC_STEPS.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `Step ${step.stepNo}: ${step.title}`,
    })),
  };
}

/**
 * BreadcrumbList for the single-page app (home only) - keeps entity graph clean.
 */
export function buildDsaBreadcrumbJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: DSA_CANONICAL_URL,
      },
    ],
  };
}

/** Twitter handle without @ for some meta consumers. */
export const DSA_TWITTER_SITE = CREATOR_TWITTER_HANDLE;
