import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, Globe, Star, StickyNote } from "lucide-react";
import type { Problem } from "@/data/sheet";
import { cn } from "@/lib/utils";
import {
  getPrimaryOtherLink,
  isGeeksforGeeksResource,
  LOGO_GEEKSFORGEEKS_PATH,
  LOGO_YOUTUBE_PATH,
  SHEET_FALLBACK_ICON_PX,
  SHEET_PLATFORM_ICON_LINK_BASE_CLASSES,
  SHEET_PLATFORM_LOGO_PX,
} from "@/constants/branding";
import {
  problemTitleGridClassName,
  type OptionalSheetColumnVisibility,
} from "@/constants/sheet-columns";
import { DIFFICULTY_BADGE_CLASS, DIFFICULTY_DOT_CLASS } from "../lib/difficulty-styles";

/**
 * Problem row - fixed column sheet grid on all breakpoints.
 * Narrow viewports keep column headers readable via horizontal scroll on the parent wrapper.
 */
export function ProblemRow({
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
  /** Which columns (YouTube / article / …) are visible. */
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
  const problemTitleCls = cn(
    problemTitleGridClassName(problemTitleSpanSm),
    isDone && "text-muted-foreground",
  );

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
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.12 }}
          >
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
      <span
        className={cn(
          "min-w-0 text-sm font-medium leading-snug",
          isDone && "text-muted-foreground",
        )}
      >
        {problem.title}
      </span>
    </div>
  );

  const difficultyBadge = columnVisibility.difficulty ? (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        DIFFICULTY_BADGE_CLASS[problem.difficulty],
      )}
    >
      <span className={cn("size-1.5 rounded-full", DIFFICULTY_DOT_CLASS[problem.difficulty])} />
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
      aria-label={
        hasNote
          ? "This question has a saved note. Open note editor."
          : "Add a note for this question"
      }
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
      <Star
        className={cn(
          "size-4 shrink-0 transition-all",
          isRev ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
        )}
      />
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
