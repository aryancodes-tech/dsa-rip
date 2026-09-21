import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Moon, Sun, Star, StickyNote, ChevronDown,
  RotateCcw, Check, X, Globe, FilterX, FileText, LayoutGrid, Settings, Sparkles,
  ListFilter, Clock, Code2, Monitor,
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
  CREATOR_DISPLAY_NAME,
  CREATOR_PORTFOLIO_URL,
  CREATOR_TWITTER_HANDLE,
  CREATOR_TWITTER_URL,
  DSA_LOCAL_PROGRESS_NOTICE,
  DSA_NOTE_MAX_CHARS,
  DSA_PRODUCT_DISPLAY_NAME,
} from "@/constants/creator";
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
import {
  THEME_PREFERENCE_LABEL,
  THEME_PREFERENCE_OPTIONS,
  type ThemePreference,
} from "@/constants/theme";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DSA Tracker - A2Z sheet progress" },
      { name: "description", content: "Local DSA sheet tracker: mark solved, revise, take notes, and jump to practice links. Progress stays in your browser." },
      { property: "og:title", content: "DSA Tracker" },
      { property: "og:description", content: "Track the A2Z DSA sheet locally - solved, revision, notes, and practice links." },
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
        className={cn("h-full rounded-full bg-primary", fillClassName)}
        initial={false}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </div>
  );
}

function NoteModal({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  const stored = notesStore.getValue(problem.id);
  const [val, setVal] = useState(
    stored.length > DSA_NOTE_MAX_CHARS ? stored.slice(0, DSA_NOTE_MAX_CHARS) : stored,
  );

  useEffect(() => {
    const t = setTimeout(() => notesStore.set(problem.id, val), 300);
    return () => clearTimeout(t);
  }, [val, problem.id]);

  const remaining = DSA_NOTE_MAX_CHARS - val.length;
  const nearLimit = remaining <= 200;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-border"
        initial={{ scale: 0.98, y: 6 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 6 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Note</p>
            <h3 className="font-display text-xl mt-1">{problem.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-md p-1 hover:bg-muted"><X className="size-4" /></button>
        </div>
        <textarea
          value={val}
          onChange={(e) => {
            const next = e.target.value;
            setVal(next.length > DSA_NOTE_MAX_CHARS ? next.slice(0, DSA_NOTE_MAX_CHARS) : next);
          }}
          autoFocus
          maxLength={DSA_NOTE_MAX_CHARS}
          placeholder="Approach, complexity, tricks…"
          className="h-48 w-full cursor-text resize-none rounded-lg border border-border bg-muted/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>Auto-saved locally in this browser.</p>
          <p
            className={cn(
              "tabular-nums",
              nearLimit && "font-medium text-foreground",
              remaining === 0 && "text-destructive",
            )}
            aria-live="polite"
          >
            {val.length.toLocaleString()} / {DSA_NOTE_MAX_CHARS.toLocaleString()}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Enlarged view for sheet row preview images (e.g. pattern diagrams). */
function PatternDiagramDialog({
  open,
  onOpenChange,
  imageUrl,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  title: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(96vw,56rem)] max-w-[min(96vw,56rem)] gap-0 overflow-y-auto rounded-2xl p-4 sm:rounded-2xl sm:p-6">
        <DialogHeader className="space-y-1 pr-6 text-left">
          <DialogTitle className="font-display text-base leading-snug sm:text-lg">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Enlarged pattern diagram. Close with the button or Escape.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3 flex justify-center rounded-xl border border-border/60 bg-white p-2 sm:p-4 dark:bg-zinc-950">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-auto max-h-[min(78vh,720px)] w-full max-w-full object-contain"
              loading="eager"
              decoding="async"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmReset({ onClose, onConfirm }: { onClose: () => void; onConfirm: (keepNotes: boolean) => void }) {
  const [keep, setKeep] = useState(true);
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border"
        initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
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
 * Problem row - fixed column sheet grid on all breakpoints.
 * Narrow viewports keep column headers readable via horizontal scroll on the parent wrapper.
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
  onExpandPatternImage,
}: {
  problem: Problem;
  isDone: boolean;
  isRev: boolean;
  hasNote: boolean;
  /** Raster URL for LeetCode (light vs dark artwork). Lavender uses the light asset. */
  leetcodeLogoSrc: string;
  /** Which optional columns (YouTube / article / …) are visible. */
  columnVisibility: OptionalSheetColumnVisibility;
  /** `sm:` grid span for title from {@link computeProblemTitleColSpanSm}. */
  problemTitleSpanSm: number;
  onToggleDone: () => void;
  onToggleRev: () => void;
  onOpenNote: () => void;
  /** When set and {@link problem.imageUrl} is present, thumbnail opens enlarged preview. */
  onExpandPatternImage?: () => void;
}) {
  const primaryOther = getPrimaryOtherLink(problem.others);
  const deskCell = "col-span-1 flex justify-center";
  const problemTitleCls = cn(problemTitleGridClassName(problemTitleSpanSm), isDone && "text-muted-foreground");

  const solvedToggle = (
    <button
      type="button"
      onClick={onToggleDone}
      aria-label="Toggle solved"
      className={cn(
        "box-border inline-flex aspect-square h-5 w-5 max-h-5 max-w-5 min-h-0 min-w-[1.25rem] shrink-0 cursor-pointer items-center justify-center rounded-md border p-0 touch-manipulation appearance-none transition-all [-webkit-tap-highlight-color:transparent]",
        isDone ? "bg-primary border-primary" : "border-border hover:border-primary/60",
      )}
    >
      <AnimatePresence>
        {isDone && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.12 }}>
            <Check className="size-3.5 text-primary-foreground" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );

  const titleBlock = (
    <div className="flex min-w-0 items-center gap-2">
      {problem.imageUrl ? (
        onExpandPatternImage ? (
          <button
            type="button"
            onClick={onExpandPatternImage}
            title="View larger pattern"
            aria-label={`View larger pattern diagram: ${problem.title}`}
            className={cn(
              "shrink-0 rounded-md border border-neutral-200/90 bg-white p-0 shadow-sm touch-manipulation dark:border-zinc-700 dark:bg-zinc-950",
              "cursor-zoom-in transition-[box-shadow,transform] hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <img
              src={problem.imageUrl}
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-[inherit] object-contain"
              loading="lazy"
              decoding="async"
            />
          </button>
        ) : (
          <img
            src={problem.imageUrl}
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-md border border-neutral-200/90 bg-white object-contain shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
            loading="lazy"
            decoding="async"
          />
        )
      ) : null}
      <span className={cn("min-w-0 text-sm font-medium leading-snug", isDone && "text-muted-foreground")}>
        {problem.title}
      </span>
    </div>
  );

  const difficultyBadge = columnVisibility.difficulty ? (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        diffColor[problem.difficulty],
      )}
    >
      <span className={cn("size-1.5 rounded-full", diffDot[problem.difficulty])} />
      {problem.difficulty}
    </span>
  ) : null;

  const emptyDash = <span className="text-muted-foreground/40">-</span>;

  const youtubeAction = columnVisibility.youtube ? (
    problem.youtubeLink ? (
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
      emptyDash
    )
  ) : null;

  const leetcodeAction = problem.lcLink ? (
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
    emptyDash
  );

  const otherAction = primaryOther ? (
    <a
      href={primaryOther.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        SHEET_PLATFORM_ICON_LINK_BASE_CLASSES,
        "text-emerald-600 dark:text-emerald-400 lavender:text-emerald-700",
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
    emptyDash
  );

  const articleAction = columnVisibility.article ? (
    problem.articleLink ? (
      <a
        href={problem.articleLink}
        target="_blank"
        rel="noreferrer"
        className={cn(SHEET_PLATFORM_ICON_LINK_BASE_CLASSES, "text-primary")}
        title="Article"
        aria-label="Open article"
      >
        <FileText className="size-5 shrink-0" aria-hidden />
      </a>
    ) : (
      emptyDash
    )
  ) : null;

  const noteAction = columnVisibility.note ? (
    <button
      type="button"
      onClick={onOpenNote}
      className={cn(
        "relative inline-flex size-9 cursor-pointer items-center justify-center rounded-md touch-manipulation [-webkit-tap-highlight-color:transparent] sm:size-auto sm:p-1.5",
        hasNote ? "text-primary" : "text-muted-foreground",
        "hover:bg-muted",
      )}
      title={hasNote ? "Has note - click to view or edit" : "Add note"}
      aria-label={hasNote ? "This question has a saved note. Open note editor." : "Add a note for this question"}
    >
      <span className="relative inline-flex shrink-0">
        <StickyNote className="size-4 shrink-0" aria-hidden />
        {hasNote ? (
          <span
            aria-hidden
            className="pointer-events-none absolute -right-1 -top-1 size-2 rounded-full bg-primary shadow-sm ring-2 ring-background dark:ring-zinc-950"
          />
        ) : null}
      </span>
    </button>
  ) : null;

  const revisionAction = columnVisibility.revision ? (
    <button
      type="button"
      onClick={onToggleRev}
      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md touch-manipulation [-webkit-tap-highlight-color:transparent] sm:size-auto sm:p-1.5 hover:bg-muted"
      title="Mark for revision"
    >
      <Star className={cn("size-4 shrink-0 transition-all", isRev ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
    </button>
  ) : null;

  return (
    <div className="grid grid-cols-12 items-center gap-2 border-t border-border/60 px-3 py-3 transition-colors hover:bg-muted/40 sm:gap-3 sm:px-6">
      <div className="col-span-1 flex justify-center self-center">{solvedToggle}</div>
      <div className={problemTitleCls}>{titleBlock}</div>
      {columnVisibility.youtube && <div className={deskCell}>{youtubeAction}</div>}
      <div className={deskCell}>{leetcodeAction}</div>
      <div className={deskCell}>{otherAction}</div>
      {columnVisibility.article && <div className={deskCell}>{articleAction}</div>}
      {columnVisibility.note && <div className={deskCell}>{noteAction}</div>}
      {columnVisibility.revision && <div className={deskCell}>{revisionAction}</div>}
      {columnVisibility.difficulty && (
        <div className="col-span-2 flex justify-center">{difficultyBadge}</div>
      )}
    </div>
  );
}

/** Shared height/chrome for Settings, Theme, and filter pills. */
const FILTER_TRIGGER_CLASS =
  "cursor-pointer inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-medium shadow-sm hover:bg-muted touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-background";

/** Square companion for Settings (same height as {@link FILTER_TRIGGER_CLASS}). */
const TOOLBAR_ICON_BTN_CLASS =
  "cursor-pointer inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-xs shadow-sm hover:bg-muted touch-manipulation";

/**
 * Styled filter menu (replaces native `<select>` so Difficulty / Status match the rest of the UI).
 */
function FilterMenu({
  value,
  onChange,
  options,
  allLabel,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  /** Label shown when `value` is `"All"`. */
  allLabel: string;
  /** Optional leading icon (e.g. list / clock). */
  icon?: ReactNode;
}) {
  const label = value === "All" ? allLabel : value;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn(FILTER_TRIGGER_CLASS, "min-w-[9.5rem] justify-between gap-2")}>
          <span className="flex min-w-0 items-center gap-1.5">
            {icon}
            <span className="truncate">{label}</span>
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="min-w-[10rem]">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o} value={o} className="cursor-pointer text-sm">
              {o === "All" ? allLabel : o}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Index() {
  const isMobile = useIsMobile();
  const { preference, theme, setTheme } = useTheme();
  const leetcodeLogoSrc = leetCodeLogoPublicPath(theme);
  const done = useSetStore(doneStore);
  const rev = useSetStore(revStore);
  const notes = useNotesStore();

  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [revOnly, setRevOnly] = useState(false);
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set());
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set());
  const [noteFor, setNoteFor] = useState<Problem | null>(null);
  const [patternImagePreview, setPatternImagePreview] = useState<{ url: string; title: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const openStepsInitialized = useRef(false);
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

  /** ⌘/Ctrl+K focuses the sheet search field (matches header shortcut hint). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /**
   * Once after hydrate: open the first incomplete step/sub-step so completed work stays collapsed.
   * Parent shell hydrates localStorage in a layout effect before this effect runs.
   */
  useEffect(() => {
    if (openStepsInitialized.current) return;
    openStepsInitialized.current = true;
    const nextUnsolved = ALL_PROBLEMS.find((p) => !done.has(p.id));
    if (nextUnsolved) {
      setOpenSteps(new Set([nextUnsolved.stepNo]));
      setOpenSubs(new Set([`${nextUnsolved.stepNo}-${nextUnsolved.subStepNo}`]));
      return;
    }
    setOpenSteps(new Set());
    setOpenSubs(new Set());
  }, [done]);

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
    const solvedList = ALL_PROBLEMS.filter((p) => done.has(p.id));
    return {
      total: TOTAL,
      solved: solvedList.length,
      pct: TOTAL ? (solvedList.length / TOTAL) * 100 : 0,
      revCount: rev.size,
      easy: solvedList.filter((p) => p.difficulty === "Easy").length,
      medium: solvedList.filter((p) => p.difficulty === "Medium").length,
      hard: solvedList.filter((p) => p.difficulty === "Hard").length,
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

  const difficultyBreakdown = (
    [
      { key: "Easy" as const, solved: stats.easy, pool: TOTAL_BY_DIFF.Easy },
      { key: "Medium" as const, solved: stats.medium, pool: TOTAL_BY_DIFF.Medium },
      { key: "Hard" as const, solved: stats.hard, pool: TOTAL_BY_DIFF.Hard },
    ] satisfies { key: "Easy" | "Medium" | "Hard"; solved: number; pool: number }[]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Dashboard card - brand, difficulty, filters */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:rounded-3xl">
          <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-7">
            {/* Brand row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-foreground sm:size-14">
                  <Code2 className="size-7 sm:size-8" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
                    {DSA_PRODUCT_DISPLAY_NAME}
                  </h1>
                  <p className="mt-0.5 text-sm leading-snug tabular-nums text-muted-foreground">
                    <span className="font-medium text-foreground">{stats.solved}</span>
                    {" of "}
                    {stats.total}
                    {" solved"}
                    <span className="mx-1.5 text-border">•</span>
                    {Math.round(stats.pct)}% complete
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Theme: ${THEME_PREFERENCE_LABEL[preference]}`}
                      className={FILTER_TRIGGER_CLASS}
                    >
                      {preference === "system" ? (
                        <Monitor className="size-3.5" aria-hidden />
                      ) : preference === "dark" ? (
                        <Moon className="size-3.5" aria-hidden />
                      ) : preference === "lavender" ? (
                        <Sparkles className="size-3.5" aria-hidden />
                      ) : (
                        <Sun className="size-3.5" aria-hidden />
                      )}
                      <span className="hidden sm:inline">{THEME_PREFERENCE_LABEL[preference]}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    // Mobile: left-align under the compact icon trigger.
                    // Desktop: right-align under the wider pill (controls sit on the right).
                    align={isMobile ? "start" : "end"}
                    sideOffset={8}
                    collisionPadding={12}
                    className="min-w-[10.5rem] p-1.5"
                  >
                    <DropdownMenuLabel className="px-2 pb-1 pt-0.5 text-xs font-normal text-muted-foreground">
                      Theme
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={preference}
                      onValueChange={(v) => setTheme(v as ThemePreference)}
                    >
                      {THEME_PREFERENCE_OPTIONS.map((opt) => (
                        <DropdownMenuRadioItem key={opt} value={opt} className="cursor-pointer gap-2 text-sm">
                          {opt === "system" ? (
                            <Monitor className="size-3.5 shrink-0" aria-hidden />
                          ) : opt === "dark" ? (
                            <Moon className="size-3.5 shrink-0" aria-hidden />
                          ) : opt === "lavender" ? (
                            <Sparkles className="size-3.5 shrink-0" aria-hidden />
                          ) : (
                            <Sun className="size-3.5 shrink-0" aria-hidden />
                          )}
                          {THEME_PREFERENCE_LABEL[opt]}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" aria-label="Settings" className={TOOLBAR_ICON_BTN_CLASS}>
                      <Settings className="size-3.5" aria-hidden />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="w-[min(92vw,18rem)]">
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      Preferences
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 text-sm"
                      onSelect={() => setConfirmReset(true)}
                    >
                      <RotateCcw className="size-4 shrink-0" aria-hidden />
                      Reset progress…
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                      <LayoutGrid className="size-3.5" aria-hidden />
                      Sheet columns
                    </DropdownMenuLabel>
                    <p className="px-2 pb-1 text-[10px] leading-snug text-muted-foreground">
                      Choose which optional columns appear in the problem sheet. LeetCode and Others always stay on.
                    </p>
                    {OPTIONAL_SHEET_COLUMNS_IN_ORDER.map((key) => (
                      <DropdownMenuCheckboxItem
                        key={key}
                        className="text-sm"
                        checked={optionalColumnVisibility[key]}
                        onCheckedChange={(checked) => updateOptionalColumn(key, checked === true)}
                      >
                        {OPTIONAL_SHEET_COLUMN_LABEL[key]}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Difficulty breakdown - solid theme tints (no gradients) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {difficultyBreakdown.map(({ key, solved, pool }) => (
                <div
                  key={key}
                  className={cn(
                    "min-w-0 rounded-2xl border px-3.5 py-3 sm:px-4 sm:py-3.5",
                    key === "Easy" && "border-[color:var(--easy)]/35 bg-[color:var(--easy)]/12",
                    key === "Medium" && "border-[color:var(--medium)]/35 bg-[color:var(--medium)]/12",
                    key === "Hard" && "border-[color:var(--hard)]/35 bg-[color:var(--hard)]/12",
                  )}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <span className={cn("size-2 shrink-0 rounded-full", diffDot[key])} aria-hidden />
                    {key}
                  </div>
                  <p className="mt-1.5 text-lg font-semibold tabular-nums tracking-tight sm:text-xl">
                    {solved}
                    <span className="text-sm font-medium text-muted-foreground"> / {pool}</span>
                  </p>
                  <ProgressBar
                    value={pool ? (solved / pool) * 100 : 0}
                    className="mt-2.5 h-1.5 bg-background/70"
                    fillClassName={
                      key === "Easy"
                        ? "bg-[color:var(--easy)]"
                        : key === "Medium"
                          ? "bg-[color:var(--medium)]"
                          : "bg-[color:var(--hard)]"
                    }
                  />
                </div>
              ))}
            </div>

            {/* Filters + search */}
            <div
              ref={flashRef}
              className="flex flex-col gap-2.5 border-t border-border/50 pt-4 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <div className="flex flex-wrap items-center gap-2">
                <FilterMenu
                  value={diffFilter}
                  onChange={setDiffFilter}
                  options={["All", "Easy", "Medium", "Hard"]}
                  allLabel="All Difficulty"
                  icon={<ListFilter className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />}
                />
                <FilterMenu
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={["All", "Solved", "Unsolved"]}
                  allLabel="All Status"
                  icon={<Clock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />}
                />
                <button
                  type="button"
                  onClick={() => setRevOnly((v) => !v)}
                  aria-pressed={revOnly}
                  className={cn(
                    FILTER_TRIGGER_CLASS,
                    "relative",
                    revOnly ? "border-primary/40 bg-primary/10 text-primary" : "",
                  )}
                  title={revOnly ? "Show all problems" : "Show only revision-marked problems"}
                >
                  <Star className={cn("size-3.5", revOnly && "fill-primary")} aria-hidden />
                  Revision
                  {stats.revCount > 0 ? (
                    <span
                      aria-label={`${stats.revCount} marked for revision`}
                      className={cn(
                        "absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums leading-none shadow-sm ring-2 ring-card",
                        revOnly
                          ? "bg-primary text-primary-foreground"
                          : "bg-amber-500 text-white",
                      )}
                    >
                      {stats.revCount > 99 ? "99+" : stats.revCount}
                    </span>
                  ) : null}
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
                    "inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-muted-foreground touch-manipulation",
                    hasActiveProblemFilters
                      ? "cursor-pointer hover:bg-muted hover:text-foreground"
                      : "cursor-not-allowed opacity-40",
                  )}
                  title={
                    hasActiveProblemFilters ? "Clear difficulty, status, revision-only, and search" : "No filters applied"
                  }
                >
                  <FilterX className="size-3.5" /> Reset filters
                </button>
              </div>
              <div className="relative w-full sm:ml-auto sm:max-w-md sm:flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search topics, subtopics & problems…"
                  className="min-h-10 w-full cursor-text rounded-xl border border-border/80 bg-background/80 py-2 pl-9 pr-14 text-base shadow-sm sm:min-h-0 sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none rounded-md border border-border bg-muted/80 px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:inline-block">
                  ⌘ K
                </kbd>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <div className="mt-6 space-y-4 sm:space-y-6">
          {SHEET.map((step) => {
            const stepProblems = step.subSteps.flatMap((s) => s.problems);
            const visibleProblems = stepProblems.filter((p) => filteredIds.has(p.id));
            if (visibleProblems.length === 0) return null;
            const stepFilteredTotal = visibleProblems.length;
            const stepDoneInFilter = visibleProblems.filter((p) => done.has(p.id)).length;
            const stepPct = stepFilteredTotal ? (stepDoneInFilter / stepFilteredTotal) * 100 : 0;
            const isOpen = openSteps.has(step.stepNo);
            const stepComplete =
              stepProblems.length > 0 && stepProblems.every((p) => done.has(p.id));
            return (
              <div key={step.stepNo} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <ProgressBar value={stepPct} className="h-1.5 rounded-none" fillClassName="rounded-none" />
                <button
                  type="button"
                  onClick={() => toggleStep(step.stepNo)}
                  className="cursor-pointer w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/40 transition-colors sm:gap-4 sm:px-7 sm:py-5"
                >
                  <span className="min-w-0 text-sm leading-snug">
                    <span className="font-normal text-muted-foreground">Step {step.stepNo}:</span>{" "}
                    <span className="font-display text-base sm:text-lg font-medium text-foreground">{step.stepTitle}</span>
                    {stepComplete ? (
                      <span className="ml-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Done
                      </span>
                    ) : null}
                  </span>
                  <div className="ml-auto flex items-center gap-3 shrink-0 sm:gap-4">
                    <span className="text-xs font-medium tabular-nums text-muted-foreground hidden sm:inline">
                      {stepDoneInFilter} / {stepFilteredTotal}
                    </span>
                    <span className="text-xs font-medium tabular-nums text-primary w-9 text-right">{Math.round(stepPct)}%</span>
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform duration-150",
                        isOpen && "rotate-180",
                      )}
                    />
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-4 pt-3 space-y-3 sm:px-6 sm:pb-7 sm:pt-5 sm:space-y-4">
                        {step.subSteps.map((sub) => {
                          const visible = sub.problems.filter((p) => filteredIds.has(p.id));
                          if (visible.length === 0) return null;
                          const subFilteredTotal = visible.length;
                          const subDoneInFilter = visible.filter((p) => done.has(p.id)).length;
                          const subPct = subFilteredTotal ? (subDoneInFilter / subFilteredTotal) * 100 : 0;
                          const k = `${step.stepNo}-${sub.subStepNo}`;
                          const subOpen = openSubs.has(k);
                          return (
                            <div key={k} className="rounded-xl border border-border bg-card overflow-hidden">
                              <ProgressBar value={subPct} className="h-1 rounded-none bg-muted/60" fillClassName="rounded-none" />
                              <button
                                type="button"
                                onClick={() => toggleSub(k)}
                                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors sm:px-6 sm:py-4"
                              >
                                <span className="min-w-0 text-sm leading-snug">
                                  <span className="font-medium text-muted-foreground tabular-nums">{step.stepNo}.{sub.subStepNo}</span>{" "}
                                  <span className="font-semibold text-foreground">{sub.subStepTitle}</span>
                                </span>
                                <div className="ml-auto flex items-center gap-3 shrink-0">
                                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                                    {subDoneInFilter} / {subFilteredTotal}
                                  </span>
                                  <span className="text-xs font-semibold tabular-nums text-primary w-9 text-right">{Math.round(subPct)}%</span>
                                  <ChevronDown
                                    className={cn(
                                      "size-4 text-muted-foreground transition-transform duration-150",
                                      subOpen && "rotate-180",
                                    )}
                                  />
                                </div>
                              </button>
                              <AnimatePresence initial={false}>
                                {subOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-3 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-5">
                                      <div className="relative -mx-3 sm:mx-0">
                                        <div className="overflow-x-auto overscroll-x-contain px-3 [-webkit-overflow-scrolling:touch] sm:px-0">
                                          {/* min width: see DSA_PROBLEM_GRID_MIN_WIDTH_REM in constants/layout.ts */}
                                          <div className="w-full min-w-[52rem]">
                                            <div className="grid grid-cols-12 items-center gap-2 border-t border-border/60 px-2 py-3 text-[10px] uppercase tracking-wide text-muted-foreground sm:gap-3 sm:text-[11px] sm:tracking-wider">
                                        <div className="col-span-1 text-center whitespace-nowrap">Status</div>
                                        <div
                                          className={cn(
                                            problemTitleGridClassName(problemTitleSpanSm),
                                            "whitespace-nowrap text-[10px] font-normal sm:text-[11px]",
                                          )}
                                        >
                                          Problem
                                        </div>
                                        {optionalColumnVisibility.youtube && (
                                          <div className="col-span-1 text-center whitespace-nowrap">YouTube</div>
                                        )}
                                        <div className="col-span-1 text-center whitespace-nowrap">LeetCode</div>
                                        <div className="col-span-1 text-center whitespace-nowrap">Others</div>
                                        {optionalColumnVisibility.article && (
                                          <div className="col-span-1 text-center whitespace-nowrap">Article</div>
                                        )}
                                        {optionalColumnVisibility.note && (
                                          <div className="col-span-1 text-center whitespace-nowrap">Note</div>
                                        )}
                                        {optionalColumnVisibility.revision && (
                                          <div className="col-span-1 text-center whitespace-nowrap">Revision</div>
                                        )}
                                        {optionalColumnVisibility.difficulty && (
                                          <div className="col-span-2 text-center whitespace-nowrap">Difficulty</div>
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
                                          onExpandPatternImage={
                                            p.imageUrl
                                              ? () => setPatternImagePreview({ url: p.imageUrl!, title: p.title })
                                              : undefined
                                          }
                                        />
                                      </div>
                                    ))}
                                          </div>
                                        </div>
                                      </div>
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
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No problems match your filters.</div>
          )}
        </div>

        <footer className="mt-10 border-t border-border/60 pt-5 pb-2 text-center text-xs text-muted-foreground sm:mt-12 sm:pt-6">
          <p className="px-2">{DSA_LOCAL_PROGRESS_NOTICE}</p>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2">
            <span>
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
            <a
              href={CREATOR_TWITTER_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              {CREATOR_TWITTER_HANDLE}
            </a>
          </p>
        </footer>
      </div>

      <PatternDiagramDialog
        open={patternImagePreview !== null}
        onOpenChange={(open) => {
          if (!open) setPatternImagePreview(null);
        }}
        imageUrl={patternImagePreview?.url ?? null}
        title={patternImagePreview?.title ?? ""}
      />

      <AnimatePresence>
        {noteFor && <NoteModal problem={noteFor} onClose={() => setNoteFor(null)} />}
        {confirmReset && <ConfirmReset onClose={() => setConfirmReset(false)} onConfirm={doReset} />}
      </AnimatePresence>
    </div>
  );
}
