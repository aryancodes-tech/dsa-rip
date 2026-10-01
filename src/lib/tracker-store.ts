import {
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
  useLayoutEffect,
} from "react";
import {
  decodeNotesMap,
  decodeProblemIdSet,
  encodeNotesMap,
  encodeProblemIdSet,
  notesStoredAsLegacyObject,
  problemSetStoredAsLegacyFlatIds,
} from "./dsa-local-storage-schema";
import {
  type ThemePreference,
  type ResolvedTheme,
  DSA_THEME_DEFAULT,
  THEME_COLOR_SCHEME,
  migrateStoredTheme,
  themeToWire,
} from "@/constants/theme";

/** localStorage keys; export for deliberate clears (e.g. reset flows). */
export const DSA_LS_KEYS = {
  done: "dsa.done",
  rev: "dsa.rev",
  notes: "dsa.notes",
  theme: "dsa.theme",
  /** Bitmask 0–31: columns YouTube, Article, Note, Revision, Difficulty (see `sheet-columns.ts`). */
  optionalColumnMask: "dsa.ui.colm",
  /** `"1"` once the product tour was completed or skipped. */
  tourDone: "dsa.ui.tour",
  /** Changelog id from {@link DSA_WHATS_NEW_VERSION} after the visitor dismisses “What changed”. */
  whatsNewSeen: "dsa.ui.whatsnew",
} as const;

type Listener = () => void;

/**
 * Stable empty snapshots for React `useSyncExternalStore#getServerSnapshot` (`Object.is` safety).
 *
 * Persisted tracker state hydrates from the app shell (`useHydratePersistedTracker`) in a layout effect - before paint -
 * so SSR + React’s initial hydrated render both see empty data and DOM text matches.
 */
const SSR_SNAPSHOT_DONE = new Set<string>();
const SSR_SNAPSHOT_REV = new Set<string>();
const SSR_SNAPSHOT_NOTES = Object.freeze({}) as Record<string, string>;

/** Per-store hydrate callbacks registered below; invoked from {@link hydratePersistedTrackerShell}. */
const trackerHydrationTasks: Array<() => void> = [];

/** Applies `dark` / `lavender` classes and native `color-scheme` on `<html>`. */
function applyThemeClassToDocument(mode: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.classList.toggle("lavender", mode === "lavender");
  root.style.colorScheme = THEME_COLOR_SCHEME[mode];
}

/**
 * Returns a copy of `current` with `ids` removed. Empty ids are ignored.
 * Used to uncheck solved status for a step/sub-step without touching revision or notes.
 */
export function omitIdsFromSet(current: ReadonlySet<string>, ids: Iterable<string>): Set<string> {
  const next = new Set(current);
  for (const id of ids) {
    if (id.length === 0) continue;
    next.delete(id);
  }
  return next;
}

function createSetStore(key: string, ssrSnapshotForHook: ReadonlySet<string>) {
  const listeners = new Set<Listener>();
  let state: Set<string> = new Set();
  let storageHydrated = false;
  const hydrateFromBrowser = () => {
    if (storageHydrated || typeof window === "undefined") return;
    storageHydrated = true;
    try {
      const rawSeen = localStorage.getItem(key);
      state = decodeProblemIdSet(rawSeen);
      if (problemSetStoredAsLegacyFlatIds(rawSeen)) {
        try {
          localStorage.setItem(key, encodeProblemIdSet(state));
        } catch {
          /** ignore quota */
        }
      }
    } catch {
      state = new Set();
    }
    emit();
  };
  trackerHydrationTasks.push(hydrateFromBrowser);
  const persist = () => {
    try {
      localStorage.setItem(key, encodeProblemIdSet(state));
    } catch {
      /** QuotaExceededError - keep runtime state best-effort. */
    }
  };
  const emit = () => listeners.forEach((l) => l());
  return {
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    get: () => state,
    /** Server-only snapshot aligned with deferred client hydration (`SSR_SNAPSHOT_*`). */
    getServerSnapshot: () => ssrSnapshotForHook,
    has: (id: string) => state.has(id),
    toggle(id: string) {
      const next = new Set(state);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      state = next;
      persist();
      emit();
    },
    clear() {
      state = new Set();
      persist();
      emit();
    },
    /**
     * Unchecks the given problem ids (no-op for ids that were not solved).
     * Does not emit when nothing in `ids` was present.
     */
    removeMany(ids: Iterable<string>) {
      const next = omitIdsFromSet(state, ids);
      if (next.size === state.size) return;
      state = next;
      persist();
      emit();
    },
  };
}

function createCompactNotesStore(key: string, ssrSnapshotForHook: Readonly<Record<string, string>>) {
  const listeners = new Set<Listener>();
  let state: Record<string, string> = {};
  let storageHydrated = false;
  const hydrateFromBrowser = () => {
    if (storageHydrated || typeof window === "undefined") return;
    storageHydrated = true;
    try {
      const rawNotes = localStorage.getItem(key);
      state = decodeNotesMap(rawNotes);
      if (notesStoredAsLegacyObject(rawNotes)) {
        try {
          localStorage.setItem(key, encodeNotesMap(state));
        } catch {
          /** ignore */
        }
      }
    } catch {
      state = {};
    }
    emit();
  };
  trackerHydrationTasks.push(hydrateFromBrowser);
  const persist = () => {
    try {
      localStorage.setItem(key, encodeNotesMap(state));
    } catch {
      /** quota / private mode - ignore */
    }
  };
  const emit = () => listeners.forEach((l) => l());
  return {
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    get: () => state,
    getServerSnapshot: () => ssrSnapshotForHook,
    getValue: (id: string) => state[id] || "",
    set(id: string, value: string) {
      state = { ...state, [id]: value };
      if (value.length === 0) {
        delete state[id];
      }
      persist();
      emit();
    },
  };
}

export const doneStore = createSetStore(DSA_LS_KEYS.done, SSR_SNAPSHOT_DONE);
export const revStore = createSetStore(DSA_LS_KEYS.rev, SSR_SNAPSHOT_REV);
export const notesStore = createCompactNotesStore(DSA_LS_KEYS.notes, SSR_SNAPSHOT_NOTES);

/**
 * Loads done/revision/notes from `localStorage` synchronously once on the browser.
 *
 * SSR + React’s initial hydrated pass intentionally see empty state so HTML matches (`useSyncExternalStore`
 * `#getServerSnapshot`). Prefer calling via {@link useHydratePersistedTracker}.
 */
export function hydratePersistedTrackerState() {
  if (typeof window === "undefined") return;
  for (const hydrate of trackerHydrationTasks) {
    hydrate();
  }
}

/**
 * Client-only hook: runs {@link hydratePersistedTrackerState} once in `useLayoutEffect` (SSR no-op).
 * Mount once on the TanStack Router shell alongside `Outlet` so persisted progress loads before browser paint.
 */
export function useHydratePersistedTracker() {
  useLayoutEffect(() => {
    hydratePersistedTrackerState();
  }, []);
}

export function useSetStore(store: ReturnType<typeof createSetStore>) {
  return useSyncExternalStore(store.subscribe, () => store.get(), () =>
    store.getServerSnapshot(),
  );
}
export function useNotesStore() {
  return useSyncExternalStore(notesStore.subscribe, () => notesStore.get(), () =>
    notesStore.getServerSnapshot(),
  );
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(DSA_THEME_DEFAULT);

  const setTheme = useCallback((mode: ThemePreference) => {
    setPreferenceState(mode);
    try {
      localStorage.setItem(DSA_LS_KEYS.theme, themeToWire(mode));
    } catch {
      /** ignore quota / private mode */
    }
    applyThemeClassToDocument(mode);
  }, []);

  useLayoutEffect(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(DSA_LS_KEYS.theme);
    } catch {
      applyThemeClassToDocument(DSA_THEME_DEFAULT);
      return;
    }
    const { preference: saved, persistWire } = migrateStoredTheme(raw);
    setPreferenceState(saved);
    applyThemeClassToDocument(saved);
    /** Persist Light for retired System tokens before first paint so OS theme no longer applies. */
    if (persistWire !== null && persistWire.length > 0) {
      try {
        localStorage.setItem(DSA_LS_KEYS.theme, persistWire);
      } catch {
        /** ignore quota / private mode */
      }
    }
  }, []);

  useEffect(() => {
    applyThemeClassToDocument(preference);
  }, [preference]);

  return {
    /** Stored menu selection. */
    preference,
    /** Concrete palette for logos / class-driven UI. */
    theme: preference,
    setTheme,
  };
}
