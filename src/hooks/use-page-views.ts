/**
 * Client-only page-view total for the footer. Starts at the historical seed,
 * then refreshes once Abacus responds. Production hosts increment; others only read.
 */

import { useEffect, useState } from "react";
import { ABACUS_PAGE_VIEWS_SEED } from "@/constants/abacus";
import { recordPageViews } from "@/lib/abacus";

/** Guards React Strict Mode double-mount so one page load cannot hit twice. */
let viewPassStarted = false;

/**
 * Returns the seed total immediately, then the live seed+Abacus total after one record/read pass.
 */
export function usePageViews(): number {
  const [pageViews, setPageViews] = useState(ABACUS_PAGE_VIEWS_SEED);

  useEffect(() => {
    if (viewPassStarted) return;
    viewPassStarted = true;

    void recordPageViews({ hostname: window.location.hostname }).then(setPageViews);
  }, []);

  return pageViews;
}
