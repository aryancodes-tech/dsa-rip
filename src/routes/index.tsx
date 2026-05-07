import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Moon, Sun, Star, StickyNote, ChevronDown,
  RotateCcw, Shuffle, Check, X, Globe, FilterX, FileText, LayoutGrid,
} from "lucide-react";
import {
  SHEET,
  ALL_PROBLEMS,
  TOTAL,
  TOTAL_BY_DIFF,
  PROBLEM_TOPIC_LABELS_BY_ID,
  type Problem,
} from "@/data/sheet";
import {
  doneStore,
  revStore,
  notesStore,
  useSetStore,
  useNotesStore,
  useTheme,
  DSA_LS_KEYS,
} from "@/lib/tracker-store";
import { cn } from "@/lib/utils";
import {
  getPrimaryOtherLink,
  isGeeksforGeeksResource,
  leetCodeLogoPublicPath,
  LOGO_GEEKSFORGEEKS_PATH,
  LOGO_YOUTUBE_PATH,
  SHEET_FALLBACK_ICON_PX,
  SHEET_PLATFORM_ICON_LINK_BASE_CLASSES,
  SHEET_PLATFORM_LOGO_PX,
} from "@/constants/branding";
import {
  computeProblemTitleColSpanSm,
  DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY,
  OPTIONAL_SHEET_COLUMN_LABEL,
  OPTIONAL_SHEET_COLUMNS_IN_ORDER,
  optionalColumnMaskToVisibility,
  problemTitleGridClassName,
  type OptionalSheetColumnKey,
  type OptionalSheetColumnVisibility,
  visibilityToOptionalColumnMask,
} from "@/constants/sheet-columns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DSA Progress Tracker — Master Data Structures & Algorithms" },
      { name: "description", content: "Track your DSA journey through DSA sheet. Mark progress, save notes, and revise — all in one elegant tracker." },
      { property: "og:title", content: "DSA Progress Tracker" },
      { property: "og:description", content: "Your personal coding roadmap." },
    ],
  }),
  component: Index,
});

const diffColor: Record<string, string> = {
  Easy: "bg-[color:var(--easy)]/15 text-[color:var(--easy)] border-[color:var(--easy)]/30",
  Medium: "bg-[color:var(--medium)]/15 text-[color:var(--medium)] border-[color:var(--medium)]/30",
  Hard: "bg-[color:var(--hard)]/15 text-[color:var(--hard)] border-[color:var(--hard)]/30",
};
const diffDot: Record<string, string> = {
  Easy: "bg-[color:var(--easy)]",
  Medium: "bg-[color:var(--medium)]",
  Hard: "bg-[color:var(--hard)]",
};

/** True when `qLower` matches the problem title, parent step title, or parent sub-step title (`qLower` already trimmed lowercased). */
function problemMatchesSearchQuery(problem: Problem, qLower: string): boolean {
  if (qLower.length === 0) return true;
  if (problem.title.toLowerCase().includes(qLower)) return true;
  const labels = PROBLEM_TOPIC_LABELS_BY_ID[problem.id];
  if (labels === undefined) return false;
  if (labels.stepTitle.toLowerCase().includes(qLower)) return true;
  if (labels.subStepTitle.toLowerCase().includes(qLower)) return true;
  return false;
}

/**
 * Horizontal progress track; `className` / `fillClassName` adjust shape (e.g. flat top bar on cards).
 */
function ProgressBar({
  value,
  className = "",
  fillClassName = "",
}: {
  value: number;
  className?: string;
  fillClassName?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-muted overflow-hidden", className)}>
      <motion.div
        className={cn("h-full rounded-full bg-gradient-to-r from-primary/70 to-primary", fillClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
      />
    </div>
  );
}

function Ring({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="4" fill="none" className="text-muted" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"
          className="text-primary"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />
      </svg>
      <span className="absolute text-xs font-semibold tabular-nums">{Math.round(value)}%</span>
    </div>
  );
}

function NoteModal({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  const initial = notesStore.getValue(problem.id);
  const [val, setVal] = useState(initial);
  useEffect(() => {
    const t = setTimeout(() => notesStore.set(problem.id, val), 300);
    return () => clearTimeout(t);
  }, [val, problem.id]);
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-border"
        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Note</p>
            <h3 className="font-display text-xl mt-1">{problem.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer p-1 rounded-md hover:bg-muted"><X className="size-4" /></button>
        </div>
        <textarea
          value={val} onChange={(e) => setVal(e.target.value)} autoFocus
          placeholder="Approach, complexity, tricks…"
          className="w-full h-48 resize-none rounded-lg bg-muted/50 border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="mt-2 text-xs text-muted-foreground">Auto-saved locally.</p>
      </motion.div>
    </motion.div>
  );
}

function ConfirmReset({ onClose, onConfirm }: { onClose: () => void; onConfirm: (keepNotes: boolean) => void }) {
  const [keep, setKeep] = useState(true);
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border"
        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-2xl">Reset all progress?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          This clears completed and revision-marked questions. This cannot be undone.
        </p>
        <label className="mt-4 flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="accent-primary" />
          Keep my notes
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="cursor-pointer px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted">Cancel</button>
          <button type="button" onClick={() => onConfirm(keep)} className="cursor-pointer px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:opacity-90">
            Reset
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Problem row — fixed column order (`youtube`→`leetcode`→`others`→`article`→`note`→`revision`→`difficulty`);
 * togglable cols omit their cell when hidden. LeetCode & Others stay on.
 *
 * `leetcodeLogoSrc` — `/public/logos/` URL from `leetCodeLogoPublicPath(theme)`; switches with the theme toggle.
 */
function ProblemRow({
  problem,
  isDone,
  isRev,
  hasNote,
  leetcodeLogoSrc,
  columnVisibility,
  problemTitleSpanSm,
  onToggleDone,
  onToggleRev,
  onOpenNote,
}: {
  problem: Problem;
  isDone: boolean;
  isRev: boolean;
  hasNote: boolean;
  /** Raster URL for LeetCode (light vs dark artwork). */
  leetcodeLogoSrc: string;
  /** Which optional columns (YouTube / article / …) are visible. */
  columnVisibility: OptionalSheetColumnVisibility;
  /** `sm:` grid span for title from {@link computeProblemTitleColSpanSm}. */
  problemTitleSpanSm: number;
  onToggleDone: () => void;
  onToggleRev: () => void;
  onOpenNote: () => void;
}) {
  const primaryOther = getPrimaryOtherLink(problem.others);
  const cell =
    "col-span-2 flex justify-center sm:col-span-1";
  const problemTitleCls = cn(problemTitleGridClassName(problemTitleSpanSm), isDone && "text-muted-foreground");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-12 gap-3 items-center px-5 py-3.5 sm:px-6 border-t border-border/60 hover:bg-muted/40 transition-colors"
    >
      <div className="col-span-1 flex justify-center">
        <button
          type="button"
          onClick={onToggleDone}
          aria-label="Toggle solved"
          className={cn(
            "cursor-pointer size-5 rounded-md border flex items-center justify-center transition-all",
            isDone ? "bg-primary border-primary" : "border-border hover:border-primary/60",
          )}
        >
          <AnimatePresence>
            {isDone && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check className="size-3.5 text-primary-foreground" strokeWidth={3} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <div className={problemTitleCls}>{problem.title}</div>
      {columnVisibility.youtube && (
        <div className={cell}>
          {problem.youtubeLink ? (
            <a
              href={problem.youtubeLink}
              target="_blank"
              rel="noreferrer"
              className={SHEET_PLATFORM_ICON_LINK_BASE_CLASSES}
              title="DSA explanation (YouTube)"
              aria-label="Open DSA YouTube explanation"
            >
              <img
                src={LOGO_YOUTUBE_PATH}
                alt=""
                className="object-contain shrink-0"
                width={SHEET_PLATFORM_LOGO_PX}
                height={SHEET_PLATFORM_LOGO_PX}
                style={{ width: SHEET_PLATFORM_LOGO_PX, height: SHEET_PLATFORM_LOGO_PX }}
              />
            </a>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </div>
      )}
      <div className={cell}>
        {problem.lcLink ? (
          <a
            href={problem.lcLink}
            target="_blank"
            rel="noreferrer"
            className={SHEET_PLATFORM_ICON_LINK_BASE_CLASSES}
            title="Open on LeetCode"
            aria-label="Open on LeetCode"
          >
            <img
              key={leetcodeLogoSrc}
              src={leetcodeLogoSrc}
              alt=""
              className="object-contain shrink-0"
              width={SHEET_PLATFORM_LOGO_PX}
              height={SHEET_PLATFORM_LOGO_PX}
              style={{ width: SHEET_PLATFORM_LOGO_PX, height: SHEET_PLATFORM_LOGO_PX }}
            />
          </a>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </div>
      <div className={cell}>
        {primaryOther ? (
          <a
            href={primaryOther.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              SHEET_PLATFORM_ICON_LINK_BASE_CLASSES,
              "text-emerald-600 dark:text-emerald-400",
            )}
            title={primaryOther.label}
            aria-label={primaryOther.label}
          >
            {isGeeksforGeeksResource(primaryOther) ? (
              <img
                src={LOGO_GEEKSFORGEEKS_PATH}
                alt=""
                className="object-contain shrink-0"
                width={SHEET_PLATFORM_LOGO_PX}
                height={SHEET_PLATFORM_LOGO_PX}
                style={{ width: SHEET_PLATFORM_LOGO_PX, height: SHEET_PLATFORM_LOGO_PX }}
              />
            ) : (
              <Globe size={SHEET_FALLBACK_ICON_PX} className="shrink-0 opacity-90" aria-hidden />
            )}
          </a>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </div>
      {columnVisibility.article && (
        <div className={cell}>
          {problem.articleLink ? (
            <a
              href={problem.articleLink}
              target="_blank"
              rel="noreferrer"
              className={cn(SHEET_PLATFORM_ICON_LINK_BASE_CLASSES, "text-primary")}
              title="TakeUForward article"
              aria-label="Open TakeUForward article"
            >
              <FileText className="size-5 shrink-0" aria-hidden />
            </a>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </div>
      )}
      {columnVisibility.note && (
        <div className={cell}>
          <button type="button" onClick={onOpenNote} className={cn("cursor-pointer p-1.5 rounded-md hover:bg-muted", hasNote ? "text-primary" : "text-muted-foreground")} title="Note">
            <StickyNote className="size-4" />
          </button>
        </div>
      )}
      {columnVisibility.revision && (
        <div className={cell}>
          <button type="button" onClick={onToggleRev} className="cursor-pointer p-1.5 rounded-md hover:bg-muted" title="Mark for revision">
            <Star className={cn("size-4 transition-all", isRev ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </button>
        </div>
      )}
      {columnVisibility.difficulty && (
        <div className="col-span-4 flex justify-end sm:col-span-2 sm:justify-center">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${diffColor[problem.difficulty]}`}>
            <span className={`size-1.5 rounded-full ${diffDot[problem.difficulty]}`} />
            {problem.difficulty}
          </span>
        </div>
      )}
    </motion.div>
  );
}

function Index() {
  const { theme, toggle } = useTheme();
  const leetcodeLogoSrc = leetCodeLogoPublicPath(theme);
  const done = useSetStore(doneStore);
  const rev = useSetStore(revStore);
  const notes = useNotesStore();

  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [revOnly, setRevOnly] = useState(false);
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set([1]));
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set());
  const [noteFor, setNoteFor] = useState<Problem | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const [optionalColumnVisibility, setOptionalColumnVisibility] =
    useState<OptionalSheetColumnVisibility>(DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY);

  const problemTitleSpanSm = useMemo(
    () => computeProblemTitleColSpanSm(optionalColumnVisibility),
    [optionalColumnVisibility],
  );

  const updateOptionalColumn = useCallback((key: OptionalSheetColumnKey, checked: boolean) => {
    setOptionalColumnVisibility((prev) => {
      const next = { ...prev, [key]: checked };
      try {
        localStorage.setItem(
          DSA_LS_KEYS.optionalColumnMask,
          String(visibilityToOptionalColumnMask(next)),
        );
      } catch {
        /** ignore quota / SSR */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      const rawMask = localStorage.getItem(DSA_LS_KEYS.optionalColumnMask);
      if (rawMask !== null && rawMask.length > 0) {
        const n = Number(rawMask);
        if (!Number.isNaN(n)) {
          setOptionalColumnVisibility(optionalColumnMaskToVisibility(n));
          return;
        }
      }
      if (localStorage.getItem("dsa.ui.article") === "1") {
        const next = {
          ...DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY,
          article: true,
        };
        setOptionalColumnVisibility(next);
        try {
          localStorage.setItem(DSA_LS_KEYS.optionalColumnMask, String(visibilityToOptionalColumnMask(next)));
        } catch {
          /** ignore */
        }
      }
    } catch {
      /** ignore */
    }
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_PROBLEMS.filter((p) => {
      if (!problemMatchesSearchQuery(p, q)) return false;
      if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
      if (statusFilter === "Solved" && !done.has(p.id)) return false;
      if (statusFilter === "Unsolved" && done.has(p.id)) return false;
      if (revOnly && !rev.has(p.id)) return false;
      return true;
    });
  }, [search, diffFilter, statusFilter, revOnly, done, rev]);

  const filteredIds = useMemo(() => new Set(filtered.map((p) => p.id)), [filtered]);

  const hasActiveProblemFilters =
    diffFilter !== "All" ||
    statusFilter !== "All" ||
    revOnly ||
    search.trim().length > 0;

  const stats = useMemo(() => {
    const solved = ALL_PROBLEMS.filter((p) => done.has(p.id));
    return {
      total: TOTAL,
      solved: solved.length,
      pct: TOTAL ? (solved.length / TOTAL) * 100 : 0,
      easy: solved.filter((p) => p.difficulty === "Easy").length,
      medium: solved.filter((p) => p.difficulty === "Medium").length,
      hard: solved.filter((p) => p.difficulty === "Hard").length,
      revCount: rev.size,
    };
  }, [done, rev]);

  const toggleStep = (n: number) => {
    setOpenSteps((s) => {
      const next = new Set(s);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
  };
  const toggleSub = (k: string) => {
    setOpenSubs((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  };

  const randomProblem = () => {
    const pool = filtered.length ? filtered : ALL_PROBLEMS;
    const p = pool[Math.floor(Math.random() * pool.length)];
    setOpenSteps((s) => new Set(s).add(p.stepNo));
    setOpenSubs((s) => new Set(s).add(`${p.stepNo}-${p.subStepNo}`));
    setTimeout(() => {
      const el = document.getElementById(p.id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.animate(
          [{ background: "color-mix(in oklab, var(--primary) 20%, transparent)" }, { background: "transparent" }],
          { duration: 1400 }
        );
      }
    }, 300);
  };

  const doReset = (keepNotes: boolean) => {
    doneStore.clear();
    revStore.clear();
    if (!keepNotes) {
      try {
        localStorage.removeItem(DSA_LS_KEYS.notes);
        window.location.reload();
      } catch {
        /** ignore */
      }
    }
    setConfirmReset(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 sm:gap-x-4"
        >
          <span className="min-w-0" aria-hidden />
          <h1 className="font-display min-w-0 justify-self-center text-center text-5xl font-bold tracking-tight sm:text-6xl">
          Welcome back, <span className="text-primary font-semibold">Aryan</span>
          </h1>
          <div className="flex min-w-0 items-center justify-end">
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className={cn(
                "cursor-pointer flex shrink-0 items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm hover:bg-muted transition-colors",
              )}
            >
              {theme === "dark" ? <Sun className="size-3.5" aria-hidden /> : <Moon className="size-3.5" aria-hidden />}
              <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"} Mode</span>
            </button>
          </div>
        </motion.div>

        {/* Stats overview — spaced sections instead of one dense grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="space-y-6 p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                <Ring value={stats.pct} size={52} />
                <div className="min-w-0 space-y-1 pt-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Overall progress</p>
                  <p className="truncate text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
                    {stats.solved}{" "}
                    <span className="font-medium text-muted-foreground text-xl sm:text-2xl">/ {stats.total}</span>
                  </p>
                  <p className="text-sm text-muted-foreground tabular-nums">{Math.round(stats.pct)}% complete</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className={cn(
                  "cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border px-4 py-2.5 text-xs font-medium transition-colors",
                  "border-border bg-muted/40 text-foreground hover:bg-muted hover:border-border sm:self-auto",
                )}
              >
                <RotateCcw className="size-3.5 text-muted-foreground" aria-hidden /> Reset progress
              </button>
            </div>

            <ProgressBar value={stats.pct} className="h-2" />

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">By difficulty</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(
                  [
                    { key: "Easy" as const, solved: stats.easy, pool: TOTAL_BY_DIFF.Easy },
                    { key: "Medium" as const, solved: stats.medium, pool: TOTAL_BY_DIFF.Medium },
                    { key: "Hard" as const, solved: stats.hard, pool: TOTAL_BY_DIFF.Hard },
                  ] satisfies { key: "Easy" | "Medium" | "Hard"; solved: number; pool: number }[]
                ).map(({ key, solved, pool }) => (
                  <div
                    key={key}
                    className={cn(
                      "flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 px-4 py-3.5",
                      key === "Easy" && "sm:border-[color:var(--easy)]/25",
                      key === "Medium" && "sm:border-[color:var(--medium)]/25",
                      key === "Hard" && "sm:border-[color:var(--hard)]/25",
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <span className={cn("size-2 shrink-0 rounded-full", diffDot[key])} aria-hidden />
                      {key}
                    </div>
                    <div className="flex items-end justify-between gap-2 tabular-nums">
                      <p className="text-lg font-semibold leading-none">{solved}</p>
                      <p className="pb-px text-[11px] text-muted-foreground">of {pool}</p>
                    </div>
                    <ProgressBar
                      value={pool ? (solved / pool) * 100 : 0}
                      className="h-1 opacity-90"
                      fillClassName={
                        key === "Easy"
                          ? "from-[color:var(--easy)]/70 to-[color:var(--easy)]"
                          : key === "Medium"
                            ? "from-[color:var(--medium)]/70 to-[color:var(--medium)]"
                            : "from-[color:var(--hard)]/70 to-[color:var(--hard)]"
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border/60 pt-5">
              <div className="flex items-start gap-2.5 text-sm leading-snug text-muted-foreground sm:items-center">
                <Star className="mt-0.5 size-4 shrink-0 fill-amber-400/90 text-amber-500 dark:text-amber-400 sm:mt-0" aria-hidden />
                <p>
                  <span className="font-semibold tabular-nums text-foreground">{stats.revCount}</span>
                  <span className="text-muted-foreground"> of </span>
                  <span className="tabular-nums text-muted-foreground">{stats.total}</span>
                  <span className="text-muted-foreground"> problems marked for revision</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div ref={flashRef} className="mt-6 flex flex-wrap items-center gap-2">
          <Select value={diffFilter} onChange={setDiffFilter} options={["All", "Easy", "Medium", "Hard"]} placeholder="All Difficulty" />
          <Select value={statusFilter} onChange={setStatusFilter} options={["All", "Solved", "Unsolved"]} placeholder="All Status" />
          <button
            type="button"
            onClick={() => setRevOnly((v) => !v)}
            className={cn(
              "cursor-pointer inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
              revOnly ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted",
            )}
          >
            <Star className={`size-3.5 ${revOnly ? "fill-primary" : ""}`} /> Revision
          </button>
          <button
            type="button"
            disabled={!hasActiveProblemFilters}
            onClick={() => {
              setDiffFilter("All");
              setStatusFilter("All");
              setRevOnly(false);
              setSearch("");
            }}
            className={cn(
              "cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium transition-colors hover:bg-muted",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:pointer-events-none disabled:hover:bg-card",
            )}
            title={
              hasActiveProblemFilters ? "Clear difficulty, status, revision-only, and search" : "No filters applied"
            }
          >
            <FilterX className="size-3.5" /> Reset filters
          </button>
          <button
            type="button"
            onClick={randomProblem}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-3 py-2 text-xs font-medium"
          >
            <Shuffle className="size-3.5" /> Random
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                <LayoutGrid className="size-3.5" aria-hidden /> Columns
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={6} className="w-[min(92vw,16rem)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Show columns</p>
              <p className="mt-1 text-[10px] text-muted-foreground leading-snug">
                Order is fixed: YouTube → LeetCode → Others → Article → Note → Revision → Difficulty.
                LeetCode & Others stay on.
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {OPTIONAL_SHEET_COLUMNS_IN_ORDER.map((key) => (
                  <li key={key}>
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={optionalColumnVisibility[key]}
                        onChange={(e) => updateOptionalColumn(key, e.target.checked)}
                        className="accent-primary size-3.5 shrink-0 rounded border-border"
                      />
                      {OPTIONAL_SHEET_COLUMN_LABEL[key]}
                    </label>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
          <div className="ml-auto relative w-full sm:w-72">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics, subtopics & problems…"
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Steps */}
        <div className="mt-6 space-y-6">
          {SHEET.map((step) => {
            const stepProblems = step.subSteps.flatMap((s) => s.problems);
            const visibleProblems = stepProblems.filter((p) => filteredIds.has(p.id));
            if (visibleProblems.length === 0) return null;
            const stepFilteredTotal = visibleProblems.length;
            const stepDoneInFilter = visibleProblems.filter((p) => done.has(p.id)).length;
            const stepPct = stepFilteredTotal ? (stepDoneInFilter / stepFilteredTotal) * 100 : 0;
            const isOpen = openSteps.has(step.stepNo);
            return (
              <motion.div layout key={step.stepNo} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <ProgressBar value={stepPct} className="h-1.5 rounded-none" fillClassName="rounded-none" />
                <button
                  type="button"
                  onClick={() => toggleStep(step.stepNo)}
                  className="cursor-pointer w-full flex items-center gap-4 px-6 py-5 sm:px-7 sm:py-5 text-left hover:bg-muted/40 transition-colors"
                >
                  <span className="text-sm leading-snug">
                    <span className="font-normal text-muted-foreground">Step {step.stepNo}:</span>{" "}
                    <span className="font-display text-base sm:text-lg font-medium text-foreground">{step.stepTitle}</span>
                  </span>
                  <div className="ml-auto flex items-center gap-4 shrink-0">
                    <span className="text-xs font-medium tabular-nums text-muted-foreground hidden sm:inline">
                      {stepDoneInFilter} / {stepFilteredTotal}
                    </span>
                    <span className="text-xs font-medium tabular-nums text-primary w-9 text-right">{Math.round(stepPct)}%</span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                      <ChevronDown className="size-4 text-muted-foreground" />
                    </motion.span>
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-6 pt-4 space-y-4 sm:px-6 sm:pb-7 sm:pt-5">
                        {step.subSteps.map((sub) => {
                          const visible = sub.problems.filter((p) => filteredIds.has(p.id));
                          if (visible.length === 0) return null;
                          const subFilteredTotal = visible.length;
                          const subDoneInFilter = visible.filter((p) => done.has(p.id)).length;
                          const subPct = subFilteredTotal ? (subDoneInFilter / subFilteredTotal) * 100 : 0;
                          const k = `${step.stepNo}-${sub.subStepNo}`;
                          const subOpen = openSubs.has(k);
                          return (
                            <div key={k} className="rounded-xl border border-border bg-background/50 overflow-hidden">
                              <ProgressBar value={subPct} className="h-1 rounded-none bg-muted/60" fillClassName="rounded-none" />
                              <button
                                type="button"
                                onClick={() => toggleSub(k)}
                                className="cursor-pointer w-full flex items-center gap-3 px-5 py-4 sm:px-6 sm:py-4 text-left hover:bg-muted/40 transition-colors"
                              >
                                <span className="text-sm leading-snug">
                                  <span className="font-medium text-muted-foreground tabular-nums">{step.stepNo}.{sub.subStepNo}</span>{" "}
                                  <span className="font-semibold text-foreground">{sub.subStepTitle}</span>
                                </span>
                                <div className="ml-auto flex items-center gap-3 shrink-0">
                                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                                    {subDoneInFilter} / {subFilteredTotal}
                                  </span>
                                  <span className="text-xs font-semibold tabular-nums text-primary w-9 text-right">{Math.round(subPct)}%</span>
                                  <motion.span animate={{ rotate: subOpen ? 180 : 0 }}>
                                    <ChevronDown className="size-4 text-muted-foreground" />
                                  </motion.span>
                                </div>
                              </button>
                              <AnimatePresence initial={false}>
                                {subOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
                                      <div className="hidden sm:grid grid-cols-12 gap-3 px-2 py-3 text-[11px] uppercase tracking-wider text-muted-foreground border-t border-border/60 items-center">
                                        <div className="col-span-1 text-center">Status</div>
                                        <div
                                          className={cn(
                                            problemTitleGridClassName(problemTitleSpanSm),
                                            "font-semibold text-muted-foreground",
                                          )}
                                        >
                                          Problem
                                        </div>
                                        {optionalColumnVisibility.youtube && (
                                          <div className="col-span-1 text-center">YouTube</div>
                                        )}
                                        <div className="col-span-1 text-center">LeetCode</div>
                                        <div className="col-span-1 text-center">Others</div>
                                        {optionalColumnVisibility.article && (
                                          <div className="col-span-1 text-center">Article</div>
                                        )}
                                        {optionalColumnVisibility.note && (
                                          <div className="col-span-1 text-center">Note</div>
                                        )}
                                        {optionalColumnVisibility.revision && (
                                          <div className="col-span-1 text-center">Revision</div>
                                        )}
                                        {optionalColumnVisibility.difficulty && (
                                          <div className="col-span-2 text-center">Difficulty</div>
                                        )}
                                      </div>
                                    {visible.map((p) => (
                                      <div id={p.id} key={p.id}>
                                        <ProblemRow
                                          problem={p}
                                          isDone={done.has(p.id)}
                                          isRev={rev.has(p.id)}
                                          hasNote={!!notes[p.id]}
                                          leetcodeLogoSrc={leetcodeLogoSrc}
                                          columnVisibility={optionalColumnVisibility}
                                          problemTitleSpanSm={problemTitleSpanSm}
                                          onToggleDone={() => doneStore.toggle(p.id)}
                                          onToggleRev={() => revStore.toggle(p.id)}
                                          onOpenNote={() => setNoteFor(p)}
                                        />
                                      </div>
                                    ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No problems match your filters.</div>
          )}
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Built for focused learners. All progress is saved locally in your browser.
        </p>
      </div>

      <AnimatePresence>
        {noteFor && <NoteModal problem={noteFor} onClose={() => setNoteFor(null)} />}
        {confirmReset && <ConfirmReset onClose={() => setConfirmReset(false)} onConfirm={doReset} />}
      </AnimatePresence>
    </div>
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-border bg-card pl-3 pr-8 py-2 text-xs font-medium hover:bg-muted cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => <option key={o} value={o}>{o === "All" ? placeholder : o}</option>)}
      </select>
      <ChevronDown className="size-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
    </div>
  );
}
