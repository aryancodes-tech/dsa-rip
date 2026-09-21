import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ALL_PROBLEMS, TOTAL, TOTAL_BY_DIFF, type Problem } from "@/data/sheet";
import {
  doneStore,
  revStore,
  useSetStore,
  useNotesStore,
  useTheme,
  DSA_LS_KEYS,
} from "@/lib/tracker-store";
import { leetCodeLogoPublicPath } from "@/constants/branding";
import {
  CREATOR_DISPLAY_NAME,
  CREATOR_PORTFOLIO_URL,
  CREATOR_TWITTER_HANDLE,
  CREATOR_TWITTER_URL,
  DSA_LOCAL_PROGRESS_NOTICE,
} from "@/constants/creator";
import {
  computeProblemTitleColSpanSm,
  DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY,
  optionalColumnMaskToVisibility,
  visibilityToOptionalColumnMask,
  type OptionalSheetColumnKey,
  type OptionalSheetColumnVisibility,
} from "@/constants/sheet-columns";
import { useIsMobile } from "@/hooks/use-mobile";
import { problemMatchesSearchQuery } from "./lib/search";
import type { DifficultyBreakdownRow } from "./lib/types";
import { ConfirmResetDialog } from "./components/ConfirmResetDialog";
import { NoteModal } from "./components/NoteModal";
import { PatternDiagramDialog } from "./components/PatternDiagramDialog";
import { SheetGrid } from "./components/SheetGrid";
import { SheetToolbar } from "./components/SheetToolbar";
import { SheetTour } from "./tour/SheetTour";
import { useSheetTour } from "./tour/useSheetTour";

export function SheetPage() {
  const isMobile = useIsMobile();
  const { preference, theme, setTheme } = useTheme();
  const leetcodeLogoSrc = leetCodeLogoPublicPath(theme);
  const done = useSetStore(doneStore);
  const rev = useSetStore(revStore);
  const notes = useNotesStore();
  const { active: tourActive, startTour, endTour } = useSheetTour();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tourSettingsDemo, setTourSettingsDemo] = useState(false);
  /** Sync lock so Radix onOpenChange cannot re-open the menu after leaving the settings step. */
  const settingsTourLockRef = useRef(false);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [revOnly, setRevOnly] = useState(false);
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set());
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set());
  const [noteFor, setNoteFor] = useState<Problem | null>(null);
  const [patternImagePreview, setPatternImagePreview] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const openStepsInitialized = useRef(false);
  const [optionalColumnVisibility, setOptionalColumnVisibility] =
    useState<OptionalSheetColumnVisibility>(DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY);

  const handleStartTour = useCallback(() => {
    settingsTourLockRef.current = false;
    setSettingsOpen(false);
    setTourSettingsDemo(false);
    startTour();
  }, [startTour]);

  const handleTourStepChange = useCallback((stepId: string | null) => {
    const onSettings = stepId === "settings";
    settingsTourLockRef.current = onSettings;
    setTourSettingsDemo(onSettings);
    setSettingsOpen(onSettings);
  }, []);

  const handleTourClose = useCallback(() => {
    settingsTourLockRef.current = false;
    setTourSettingsDemo(false);
    setSettingsOpen(false);
    endTour();
  }, [endTour]);

  const handleSettingsOpenChange = useCallback((open: boolean) => {
    if (settingsTourLockRef.current) {
      setSettingsOpen(true);
      return;
    }
    setSettingsOpen(open);
  }, []);

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
          localStorage.setItem(
            DSA_LS_KEYS.optionalColumnMask,
            String(visibilityToOptionalColumnMask(next)),
          );
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
    diffFilter !== "All" || statusFilter !== "All" || revOnly || search.trim().length > 0;

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
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };
  const toggleSub = (k: string) => {
    setOpenSubs((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
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

  const difficultyBreakdown: DifficultyBreakdownRow[] = [
    { key: "Easy", solved: stats.easy, pool: TOTAL_BY_DIFF.Easy },
    { key: "Medium", solved: stats.medium, pool: TOTAL_BY_DIFF.Medium },
    { key: "Hard", solved: stats.hard, pool: TOTAL_BY_DIFF.Hard },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <SheetToolbar
          isMobile={isMobile}
          stats={stats}
          difficultyBreakdown={difficultyBreakdown}
          preference={preference}
          onThemeChange={setTheme}
          optionalColumnVisibility={optionalColumnVisibility}
          onOptionalColumnChange={updateOptionalColumn}
          onRequestReset={() => setConfirmReset(true)}
          onStartTour={handleStartTour}
          settingsOpen={settingsOpen}
          onSettingsOpenChange={handleSettingsOpenChange}
          tourDemoArticleOff={tourSettingsDemo}
          columnTogglesDisabled={tourSettingsDemo}
          diffFilter={diffFilter}
          onDiffFilterChange={setDiffFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          revOnly={revOnly}
          onRevOnlyToggle={() => setRevOnly((v) => !v)}
          hasActiveProblemFilters={hasActiveProblemFilters}
          onClearFilters={() => {
            setDiffFilter("All");
            setStatusFilter("All");
            setRevOnly(false);
            setSearch("");
          }}
          search={search}
          onSearchChange={setSearch}
          searchInputRef={searchInputRef}
          flashRef={flashRef}
        />

        <SheetGrid
          filteredIds={filteredIds}
          filteredCount={filtered.length}
          done={done}
          rev={rev}
          notes={notes}
          openSteps={openSteps}
          openSubs={openSubs}
          optionalColumnVisibility={optionalColumnVisibility}
          problemTitleSpanSm={problemTitleSpanSm}
          leetcodeLogoSrc={leetcodeLogoSrc}
          onToggleStep={toggleStep}
          onToggleSub={toggleSub}
          onToggleDone={(id) => doneStore.toggle(id)}
          onToggleRev={(id) => revStore.toggle(id)}
          onOpenNote={setNoteFor}
          onExpandPatternImage={(p) => {
            if (p.imageUrl) setPatternImagePreview({ url: p.imageUrl, title: p.title });
          }}
        />

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
        {confirmReset && (
          <ConfirmResetDialog onClose={() => setConfirmReset(false)} onConfirm={doReset} />
        )}
      </AnimatePresence>

      <SheetTour open={tourActive} onClose={handleTourClose} onStepChange={handleTourStepChange} />
    </div>
  );
}
