import { useEffect, useState, useCallback, useSyncExternalStore } from "react";

const KEYS = {
  done: "dsa.done",
  rev: "dsa.rev",
  notes: "dsa.notes",
  theme: "dsa.theme",
  open: "dsa.open",
};

type Listener = () => void;

function createSetStore(key: string) {
  const listeners = new Set<Listener>();
  let state: Set<string> = new Set();
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(key);
      if (raw) state = new Set(JSON.parse(raw));
    } catch {}
  }
  const persist = () => {
    try {
      localStorage.setItem(key, JSON.stringify([...state]));
    } catch {}
  };
  const emit = () => listeners.forEach((l) => l());
  return {
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    get: () => state,
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

function createMapStore(key: string) {
  const listeners = new Set<Listener>();
  let state: Record<string, string> = {};
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(key);
      if (raw) state = JSON.parse(raw);
    } catch {}
  }
  const persist = () => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  };
  const emit = () => listeners.forEach((l) => l());
  return {
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    get: () => state,
    getValue: (id: string) => state[id] || "",
    set(id: string, value: string) {
      state = { ...state, [id]: value };
      if (!value) delete state[id];
      persist();
      emit();
    },
  };
}

export const doneStore = createSetStore(KEYS.done);
export const revStore = createSetStore(KEYS.rev);
export const notesStore = createMapStore(KEYS.notes);

export function useSetStore(store: ReturnType<typeof createSetStore>) {
  return useSyncExternalStore(
    store.subscribe,
    () => store.get(),
    () => store.get()
  );
}
export function useNotesStore() {
  return useSyncExternalStore(
    notesStore.subscribe,
    () => notesStore.get(),
    () => notesStore.get()
  );
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const saved = (localStorage.getItem(KEYS.theme) as "light" | "dark") || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem(KEYS.theme, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);
  return { theme, toggle };
}
