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

/** localStorage keys; export for deliberate clears (e.g. reset flows). */
export const DSA_LS_KEYS = {
  done: "dsa.done",
  rev: "dsa.rev",
  notes: "dsa.notes",
  theme: "dsa.theme",
  /** Plain string shown in the page header (“Welcome back, …”). */
  displayName: "dsa.ui.displayName",
  /** Bitmask 0–31: optional columns YouTube, Article, Note, Revision, Difficulty (see `sheet-columns.ts`). */
  optionalColumnMask: "dsa.ui.colm",
} as const;

type Listener = () => void;

/**
 * Stable empty snapshots for React `useSyncExternalStore#getServerSnapshot` (`Object.is` safety).
 *
 * Persisted tracker state hydrates from the app shell (`useHydratePersistedTracker`) in a layout effect — before paint —
 * so SSR + React’s initial hydrated render both see empty data and DOM text matches.
 */
const SSR_SNAPSHOT_DONE = new Set<string>();
const SSR_SNAPSHOT_REV = new Set<string>();
const SSR_SNAPSHOT_NOTES = Object.freeze({}) as Record<string, string>;

/** Per-store hydrate callbacks registered below; invoked from {@link hydratePersistedTrackerShell}. */
const trackerHydrationTasks: Array<() => void> = [];

function normalizeThemeStored(value: string | null): "light" | "dark" {
  if (value === null || value.length === 0) return "light";
  if (value === "d" || value === "dark") return "dark";
  return "light";
}

function themeToWire(mode: "light" | "dark"): string {
  return mode === "dark" ? "d" : "l";
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
      /** QuotaExceededError — keep runtime state best-effort. */
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
      /** quota / private mode — ignore */
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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const raw = localStorage.getItem(DSA_LS_KEYS.theme);
    const saved = normalizeThemeStored(raw);
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
    /** Shrink legacy `dark`/`light` strings once to `d`/`l`. */
    if (raw === "dark" || raw === "light") {
      try {
        localStorage.setItem(DSA_LS_KEYS.theme, themeToWire(saved));
      } catch {
        /** ignore */
      }
    }
  }, []);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem(DSA_LS_KEYS.theme, themeToWire(next));
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);
  return { theme, toggle };
}
