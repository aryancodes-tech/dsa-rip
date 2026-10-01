import { useCallback, useEffect, useState } from "react";
import { DSA_LS_KEYS } from "@/lib/tracker-store";
import { DSA_TOUR_DONE_VALUE } from "@/constants/tour";
import { DSA_WHATS_NEW_VERSION } from "@/constants/whats-new";

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
    /** First-time visitors already saw the current sheet — skip this changelog later. */
    localStorage.setItem(DSA_LS_KEYS.whatsNewSeen, DSA_WHATS_NEW_VERSION);
  } catch {
    /** ignore quota / private mode */
  }
}

/**
 * Controls the sheet product tour: auto-starts once for new visitors; Settings can replay.
 * Pass `ready` false while a splash is covering the UI so the tour does not start underneath.
 */
export function useSheetTour(options?: { ready?: boolean }) {
  const ready = options?.ready ?? true;
  const [active, setActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const done = readTourDone();
    if (!done) setActive(true);
  }, [ready]);

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
