/**
 * Quiet footer line with cumulative page views.
 */

import { usePageViews } from "@/hooks/use-page-views";
import { formatPageViewsAria, formatPageViewsText } from "@/lib/abacus";

export function VisitorStats() {
  const pageViews = usePageViews();

  return (
    <p
      className="mt-8 text-center text-[11px] tabular-nums tracking-wide text-muted-foreground/55"
      aria-label={formatPageViewsAria(pageViews)}
    >
      {formatPageViewsText(pageViews)}
    </p>
  );
}
