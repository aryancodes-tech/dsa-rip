import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Moon, Sun, Star, StickyNote, ExternalLink, ChevronDown,
  RotateCcw, Shuffle, Code2, BookOpen, Check, X, Sparkles,
} from "lucide-react";
import { SHEET, ALL_PROBLEMS, TOTAL, TOTAL_BY_DIFF, type Problem } from "@/data/sheet";
import {
  doneStore, revStore, notesStore, useSetStore, useNotesStore, useTheme,
} from "@/lib/tracker-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DSA Progress Tracker — Master Data Structures & Algorithms" },
      { name: "description", content: "Track your DSA journey through Striver's A2Z sheet. Mark progress, save notes, and revise — all in one elegant tracker." },
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

function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 w-full rounded-full bg-muted overflow-hidden ${className}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
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
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="size-4" /></button>
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
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted">Cancel</button>
          <button onClick={() => onConfirm(keep)} className="px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:opacity-90">
            Reset
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProblemRow({ problem, isDone, isRev, hasNote, onToggleDone, onToggleRev, onOpenNote }: {
  problem: Problem; isDone: boolean; isRev: boolean; hasNote: boolean;
  onToggleDone: () => void; onToggleRev: () => void; onOpenNote: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-t border-border/60 hover:bg-muted/40 transition-colors"
    >
      <div className="col-span-1 flex justify-center">
        <button
          onClick={onToggleDone}
          aria-label="Toggle solved"
          className={`size-5 rounded-md border flex items-center justify-center transition-all ${
            isDone ? "bg-primary border-primary" : "border-border hover:border-primary/60"
          }`}
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
      <div className={`col-span-12 sm:col-span-5 text-sm ${isDone ? "text-muted-foreground line-through" : ""}`}>
        {problem.title}
      </div>
      <div className="col-span-2 sm:col-span-1 flex justify-center">
        {problem.lcLink ? (
          <a href={problem.lcLink} target="_blank" rel="noreferrer" className="p-1.5 rounded-md hover:bg-muted text-[#f89f1b]" title="LeetCode">
            <Code2 className="size-4" />
          </a>
        ) : <span className="text-muted-foreground/40">—</span>}
      </div>
      <div className="col-span-2 sm:col-span-1 flex justify-center">
        {problem.others.length > 0 ? (
          <div className="relative group">
            <button className="p-1.5 rounded-md hover:bg-muted text-emerald-600 dark:text-emerald-400" title="Other resources">
              <BookOpen className="size-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-20 min-w-[170px] rounded-lg border border-border bg-popover shadow-lg p-1">
              {problem.others.map((o, i) => (
                <a key={i} href={o.url} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs rounded hover:bg-muted">
                  {o.label} <ExternalLink className="size-3 opacity-50" />
                </a>
              ))}
            </div>
          </div>
        ) : <span className="text-muted-foreground/40">—</span>}
      </div>
      <div className="col-span-2 sm:col-span-1 flex justify-center">
        <button onClick={onOpenNote} className={`p-1.5 rounded-md hover:bg-muted ${hasNote ? "text-primary" : "text-muted-foreground"}`} title="Note">
          <StickyNote className="size-4" />
        </button>
      </div>
      <div className="col-span-2 sm:col-span-1 flex justify-center">
        <button onClick={onToggleRev} className="p-1.5 rounded-md hover:bg-muted" title="Mark for revision">
          <Star className={`size-4 transition-all ${isRev ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
        </button>
      </div>
      <div className="col-span-2 sm:col-span-2 flex justify-end sm:justify-center">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${diffColor[problem.difficulty]}`}>
          <span className={`size-1.5 rounded-full ${diffDot[problem.difficulty]}`} />
          {problem.difficulty}
        </span>
      </div>
    </motion.div>
  );
}

function Index() {
  const { theme, toggle } = useTheme();
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_PROBLEMS.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q)) return false;
      if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
      if (statusFilter === "Solved" && !done.has(p.id)) return false;
      if (statusFilter === "Unsolved" && done.has(p.id)) return false;
      if (revOnly && !rev.has(p.id)) return false;
      return true;
    });
  }, [search, diffFilter, statusFilter, revOnly, done, rev]);

  const filteredIds = useMemo(() => new Set(filtered.map((p) => p.id)), [filtered]);

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
      try { localStorage.removeItem("dsa.notes"); window.location.reload(); } catch {}
    }
    setConfirmReset(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />
            Striver's A2Z DSA Sheet
          </div>
          <button
            onClick={toggle}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted transition-colors"
          >
            {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"} Mode</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mt-8 text-center"
        >
          <h1 className="font-display text-5xl sm:text-6xl font-semibold tracking-tight">
            DSA Progress <span className="italic text-primary">Tracker</span>
          </h1>
          <div className="mx-auto mt-3 flex items-center justify-center gap-2 text-muted-foreground">
            <span className="h-px w-10 bg-border" />
            <Star className="size-3 fill-primary text-primary" />
            <span className="h-px w-10 bg-border" />
          </div>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Track your progress. Master DSA. One problem at a time.
          </p>
        </motion.div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-sm"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 items-center">
            <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
              <Ring value={stats.pct} size={64} />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Overall</p>
                <p className="font-semibold tabular-nums">{stats.solved} <span className="text-muted-foreground font-normal">/ {stats.total}</span></p>
              </div>
            </div>
            <Stat icon={<Star className="size-3.5 fill-amber-400 text-amber-400" />} label="Marked for Revision" value={stats.revCount} total={stats.total} />
            <Stat icon={<span className="size-2 rounded-full bg-[color:var(--easy)]" />} label="Easy" value={stats.easy} total={TOTAL_BY_DIFF.Easy} />
            <Stat icon={<span className="size-2 rounded-full bg-[color:var(--medium)]" />} label="Medium" value={stats.medium} total={TOTAL_BY_DIFF.Medium} />
            <Stat icon={<span className="size-2 rounded-full bg-[color:var(--hard)]" />} label="Hard" value={stats.hard} total={TOTAL_BY_DIFF.Hard} />
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 hover:bg-secondary px-3 py-2.5 text-xs font-medium transition-colors"
            >
              <RotateCcw className="size-3.5" /> Reset Progress
            </button>
          </div>
          <div className="mt-5">
            <ProgressBar value={stats.pct} />
          </div>
        </motion.div>

        {/* Filters */}
        <div ref={flashRef} className="mt-6 flex flex-wrap items-center gap-2">
          <Select value={diffFilter} onChange={setDiffFilter} options={["All", "Easy", "Medium", "Hard"]} placeholder="All Difficulty" />
          <Select value={statusFilter} onChange={setStatusFilter} options={["All", "Solved", "Unsolved"]} placeholder="All Status" />
          <button
            onClick={() => setRevOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
              revOnly ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted"
            }`}
          >
            <Star className={`size-3.5 ${revOnly ? "fill-primary" : ""}`} /> Revision
          </button>
          <button
            onClick={randomProblem}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-3 py-2 text-xs font-medium"
          >
            <Shuffle className="size-3.5" /> Random
          </button>
          <div className="ml-auto relative w-full sm:w-72">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems…"
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Steps */}
        <div className="mt-6 space-y-3">
          {SHEET.map((step) => {
            const stepProblems = step.subSteps.flatMap((s) => s.problems);
            const visibleProblems = stepProblems.filter((p) => filteredIds.has(p.id));
            if (visibleProblems.length === 0) return null;
            const stepDone = stepProblems.filter((p) => done.has(p.id)).length;
            const stepPct = (stepDone / stepProblems.length) * 100;
            const isOpen = openSteps.has(step.stepNo);
            return (
              <motion.div layout key={step.stepNo} className="rounded-2xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => toggleStep(step.stepNo)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
                >
                  <span className="text-sm font-medium">
                    Step {step.stepNo}: <span className="font-display text-base">{step.stepTitle}</span>
                  </span>
                  <div className="ml-auto flex items-center gap-4">
                    <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
                      {stepDone} / {stepProblems.length}
                    </span>
                    <Ring value={stepPct} size={36} />
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
                      <div className="px-3 pb-3 space-y-2">
                        {step.subSteps.map((sub) => {
                          const visible = sub.problems.filter((p) => filteredIds.has(p.id));
                          if (visible.length === 0) return null;
                          const subDone = sub.problems.filter((p) => done.has(p.id)).length;
                          const subPct = (subDone / sub.problems.length) * 100;
                          const k = `${step.stepNo}-${sub.subStepNo}`;
                          const subOpen = openSubs.has(k);
                          return (
                            <div key={k} className="rounded-xl border border-border bg-background/50 overflow-hidden">
                              <button
                                onClick={() => toggleSub(k)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                              >
                                <span className="text-sm">
                                  <span className="text-muted-foreground">{step.stepNo}.{sub.subStepNo}</span>{" "}
                                  {sub.subStepTitle}
                                </span>
                                <div className="ml-auto flex items-center gap-3">
                                  <span className="text-xs text-muted-foreground tabular-nums">{subDone}/{sub.problems.length}</span>
                                  <Ring value={subPct} size={30} />
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
                                    <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground border-t border-border/60">
                                      <div className="col-span-1 text-center">Status</div>
                                      <div className="col-span-5">Problem</div>
                                      <div className="col-span-1 text-center">LeetCode</div>
                                      <div className="col-span-1 text-center">Others</div>
                                      <div className="col-span-1 text-center">Note</div>
                                      <div className="col-span-1 text-center">Revision</div>
                                      <div className="col-span-2 text-center">Difficulty</div>
                                    </div>
                                    {visible.map((p) => (
                                      <div id={p.id} key={p.id}>
                                        <ProblemRow
                                          problem={p}
                                          isDone={done.has(p.id)}
                                          isRev={rev.has(p.id)}
                                          hasNote={!!notes[p.id]}
                                          onToggleDone={() => doneStore.toggle(p.id)}
                                          onToggleRev={() => revStore.toggle(p.id)}
                                          onOpenNote={() => setNoteFor(p)}
                                        />
                                      </div>
                                    ))}
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

function Stat({ icon, label, value, total }: { icon: React.ReactNode; label: string; value: number; total: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <p className="font-semibold tabular-nums">{value} <span className="text-muted-foreground font-normal text-sm">/ {total}</span></p>
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
