/**
 * Site footer + SSR SEO/AEO block (About + FAQ).
 * Visually secondary to the tracker; still present in the first HTML response.
 */

import {
  CREATOR_DISPLAY_NAME,
  CREATOR_FEEDBACK_LINK_LABEL,
  CREATOR_PORTFOLIO_URL,
  CREATOR_TWITTER_HANDLE,
  CREATOR_TWITTER_URL,
  DSA_LEETCODE_LINKS_PITCH,
  DSA_LOCAL_PROGRESS_NOTICE,
  DSA_PRODUCT_DISPLAY_NAME,
} from "@/constants/creator";
import { DSA_SEO_FAQS } from "@/constants/seo";
import { XLogo } from "@/components/XLogo";
import { TOTAL, TOTAL_BY_DIFF } from "@/data/sheet";
import { VisitorStats } from "./VisitorStats";

/**
 * Bottom-of-page credit strip, about copy, FAQ, and privacy highlight.
 */
export function SheetSeoContent() {
  return (
    <footer className="mt-10 border-t border-border/60 pt-10 pb-6 sm:mt-12 sm:pt-12 sm:pb-8">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-2 text-center text-sm sm:py-3">
        <span className="text-muted-foreground">
          Built by{" "}
          <a
            href={CREATOR_PORTFOLIO_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            {CREATOR_DISPLAY_NAME}
          </a>
        </span>
        <span className="text-border" aria-hidden>
          ·
        </span>
        <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-muted-foreground">
          <span className="text-xs sm:text-sm">{CREATOR_FEEDBACK_LINK_LABEL}</span>
          <a
            href={CREATOR_TWITTER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-2 hover:underline"
            aria-label={`${CREATOR_FEEDBACK_LINK_LABEL}: ${CREATOR_TWITTER_HANDLE} on X`}
          >
            <XLogo className="size-3.5 shrink-0" />
            {CREATOR_TWITTER_HANDLE}
          </a>
        </span>
      </div>

      <section
        className="mx-auto mt-12 max-w-3xl border-t border-border/50 pt-10 text-left sm:mt-14 sm:pt-12"
        aria-labelledby="seo-about-heading"
      >
        <h2
          id="seo-about-heading"
          className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg"
        >
          About {DSA_PRODUCT_DISPLAY_NAME}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {DSA_PRODUCT_DISPLAY_NAME} is a free Striver A2Z DSA sheet tracker for coding interview
          prep. {DSA_LEETCODE_LINKS_PITCH} Mark problems solved, star them for revision, and save
          notes across {TOTAL} problems ({TOTAL_BY_DIFF.Easy} Easy, {TOTAL_BY_DIFF.Medium} Medium,{" "}
          {TOTAL_BY_DIFF.Hard} Hard). Progress stays in this browser; no account required.
        </p>

        <h2 className="font-display mt-9 text-base font-semibold tracking-tight text-foreground sm:text-lg">
          Frequently asked questions
        </h2>
        <dl className="mt-4 divide-y divide-border/60">
          {DSA_SEO_FAQS.map((item) => (
            <div key={item.question} className="py-4 first:pt-0 last:pb-0">
              <dt className="text-sm font-medium text-foreground">{item.question}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p
        className="mx-auto mt-10 max-w-xl rounded-xl border border-border/70 bg-muted/50 px-4 py-3 text-center text-sm font-medium leading-snug text-foreground"
        role="note"
      >
        {DSA_LOCAL_PROGRESS_NOTICE}
      </p>

      <VisitorStats />
    </footer>
  );
}
