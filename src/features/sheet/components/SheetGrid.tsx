import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SHEET, type Problem } from "@/data/sheet";
import { cn } from "@/lib/utils";
import {
  problemTitleGridClassName,
  type OptionalSheetColumnVisibility,
} from "@/constants/sheet-columns";
import { ProgressBar } from "./ProgressBar";
import { ProblemRow } from "./ProblemRow";

export function SheetGrid({
  filteredIds,
  filteredCount,
  done,
  rev,
  notes,
  openSteps,
  openSubs,
  optionalColumnVisibility,
  problemTitleSpanSm,
  leetcodeLogoSrc,
  onToggleStep,
  onToggleSub,
  onToggleDone,
  onToggleRev,
  onOpenNote,
  onExpandPatternImage,
}: {
  filteredIds: Set<string>;
  filteredCount: number;
  done: ReadonlySet<string>;
  rev: ReadonlySet<string>;
  notes: Record<string, string>;
  openSteps: Set<number>;
  openSubs: Set<string>;
  optionalColumnVisibility: OptionalSheetColumnVisibility;
  problemTitleSpanSm: number;
  leetcodeLogoSrc: string;
  onToggleStep: (stepNo: number) => void;
  onToggleSub: (key: string) => void;
  onToggleDone: (problemId: string) => void;
  onToggleRev: (problemId: string) => void;
  onOpenNote: (problem: Problem) => void;
  onExpandPatternImage: (problem: Problem) => void;
}) {
  return (
    <div className="mt-6 space-y-4 sm:space-y-6">
      {SHEET.map((step) => {
        const stepProblems = step.subSteps.flatMap((s) => s.problems);
        const visibleProblems = stepProblems.filter((p) => filteredIds.has(p.id));
        if (visibleProblems.length === 0) return null;
        const stepFilteredTotal = visibleProblems.length;
        const stepDoneInFilter = visibleProblems.filter((p) => done.has(p.id)).length;
        const stepPct = stepFilteredTotal ? (stepDoneInFilter / stepFilteredTotal) * 100 : 0;
        const isOpen = openSteps.has(step.stepNo);
        const stepComplete = stepProblems.length > 0 && stepProblems.every((p) => done.has(p.id));
        return (
          <div
            key={step.stepNo}
            className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
          >
            <ProgressBar
              value={stepPct}
              className="h-1.5 rounded-none"
              fillClassName="rounded-none"
            />
            <button
              type="button"
              onClick={() => onToggleStep(step.stepNo)}
              className="cursor-pointer w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/40 transition-colors sm:gap-4 sm:px-7 sm:py-5"
            >
              <span className="min-w-0 text-sm leading-snug">
                <span className="font-normal text-muted-foreground">Step {step.stepNo}:</span>{" "}
                <span className="font-display text-base sm:text-lg font-medium text-foreground">
                  {step.stepTitle}
                </span>
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
                <span className="text-xs font-medium tabular-nums text-primary w-9 text-right">
                  {Math.round(stepPct)}%
                </span>
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
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-4 pt-3 space-y-3 sm:px-6 sm:pb-7 sm:pt-5 sm:space-y-4">
                    {step.subSteps.map((sub) => {
                      const visible = sub.problems.filter((p) => filteredIds.has(p.id));
                      if (visible.length === 0) return null;
                      const subFilteredTotal = visible.length;
                      const subDoneInFilter = visible.filter((p) => done.has(p.id)).length;
                      const subPct = subFilteredTotal
                        ? (subDoneInFilter / subFilteredTotal) * 100
                        : 0;
                      const k = `${step.stepNo}-${sub.subStepNo}`;
                      const subOpen = openSubs.has(k);
                      return (
                        <div
                          key={k}
                          className="rounded-xl border border-border bg-card overflow-hidden"
                        >
                          <ProgressBar
                            value={subPct}
                            className="h-1 rounded-none bg-muted/60"
                            fillClassName="rounded-none"
                          />
                          <button
                            type="button"
                            onClick={() => onToggleSub(k)}
                            className="cursor-pointer w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors sm:px-6 sm:py-4"
                          >
                            <span className="min-w-0 text-sm leading-snug">
                              <span className="font-medium text-muted-foreground tabular-nums">
                                {step.stepNo}.{sub.subStepNo}
                              </span>{" "}
                              <span className="font-semibold text-foreground">
                                {sub.subStepTitle}
                              </span>
                            </span>
                            <div className="ml-auto flex items-center gap-3 shrink-0">
                              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                                {subDoneInFilter} / {subFilteredTotal}
                              </span>
                              <span className="text-xs font-semibold tabular-nums text-primary w-9 text-right">
                                {Math.round(subPct)}%
                              </span>
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
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-5">
                                  <div className="relative -mx-3 sm:mx-0">
                                    <div className="overflow-x-auto overscroll-x-contain px-3 [-webkit-overflow-scrolling:touch] sm:px-0">
                                      <div className="w-full min-w-[52rem]">
                                        <div className="grid grid-cols-12 items-center gap-2 border-t border-border/60 px-2 py-3 text-[10px] uppercase tracking-wide text-muted-foreground sm:gap-3 sm:text-[11px] sm:tracking-wider">
                                          <div className="col-span-1 text-center whitespace-nowrap">
                                            Status
                                          </div>
                                          <div
                                            className={cn(
                                              problemTitleGridClassName(problemTitleSpanSm),
                                              "whitespace-nowrap text-[10px] font-normal sm:text-[11px]",
                                            )}
                                          >
                                            Problem
                                          </div>
                                          {optionalColumnVisibility.youtube && (
                                            <div className="col-span-1 text-center whitespace-nowrap">
                                              YouTube
                                            </div>
                                          )}
                                          <div className="col-span-1 text-center whitespace-nowrap">
                                            LeetCode
                                          </div>
                                          <div className="col-span-1 text-center whitespace-nowrap">
                                            Others
                                          </div>
                                          {optionalColumnVisibility.article && (
                                            <div className="col-span-1 text-center whitespace-nowrap">
                                              Article
                                            </div>
                                          )}
                                          {optionalColumnVisibility.note && (
                                            <div className="col-span-1 text-center whitespace-nowrap">
                                              Note
                                            </div>
                                          )}
                                          {optionalColumnVisibility.revision && (
                                            <div className="col-span-1 text-center whitespace-nowrap">
                                              Revision
                                            </div>
                                          )}
                                          {optionalColumnVisibility.difficulty && (
                                            <div className="col-span-2 text-center whitespace-nowrap">
                                              Difficulty
                                            </div>
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
                                              onToggleDone={() => onToggleDone(p.id)}
                                              onToggleRev={() => onToggleRev(p.id)}
                                              onOpenNote={() => onOpenNote(p)}
                                              onExpandPatternImage={
                                                p.imageUrl
                                                  ? () => onExpandPatternImage(p)
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
      {filteredCount === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No problems match your filters.
        </div>
      )}
    </div>
  );
}
