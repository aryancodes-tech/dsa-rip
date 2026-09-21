import { useCallback, useEffect, useState } from "react";
import { DSA_LS_KEYS } from "@/lib/tracker-store";
import { DSA_TOUR_DONE_VALUE } from "@/constants/tour";

function readTourDone(): boolean {
  try {
    return localStorage.getItem(DSA_LS_KEYS.tourDone) === DSA_TOUR_DONE_VALUE;
  } catch {
    return true;
  }
}

function writeTourDone() {
  try {
    localStorage.setItem(DSA_LS_KEYS.tourDone, DSA_TOUR_DONE_VALUE);
  } catch {
    /** ignore quota / private mode */
  }
}

/**
 * Controls the sheet product tour: auto-starts once for new visitors; Settings can replay.
 */
export function useSheetTour() {
  const [active, setActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const done = readTourDone();
    setHydrated(true);
    if (!done) {
      const t = window.setTimeout(() => setActive(true), 450);
      return () => window.clearTimeout(t);
    }
  }, []);

  const startTour = useCallback(() => {
    setActive(true);
  }, []);

  const endTour = useCallback(() => {
    writeTourDone();
    setActive(false);
  }, []);

  return {
    /** True after first client read of localStorage (avoids SSR flash). */
    hydrated,
    /** Tour overlay is visible. */
    active,
    startTour,
    endTour,
  };
}
