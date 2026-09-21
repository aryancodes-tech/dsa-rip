import type { Dispatch, RefObject, SetStateAction } from "react";
import {
  ChevronDown,
  Clock,
  Code2,
  FilterX,
  LayoutGrid,
  ListFilter,
  Monitor,
  Moon,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  OPTIONAL_SHEET_COLUMN_LABEL,
  OPTIONAL_SHEET_COLUMNS_IN_ORDER,
  type OptionalSheetColumnKey,
  type OptionalSheetColumnVisibility,
} from "@/constants/sheet-columns";
import { DSA_PRODUCT_DISPLAY_NAME } from "@/constants/creator";
import {
  THEME_PREFERENCE_LABEL,
  THEME_PREFERENCE_OPTIONS,
  type ThemePreference,
} from "@/constants/theme";
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
import { DIFFICULTY_DOT_CLASS } from "../lib/difficulty-styles";
import { FILTER_TRIGGER_CLASS, TOOLBAR_ICON_BTN_CLASS } from "../lib/toolbar-classes";
import type { DifficultyBreakdownRow, SheetStats } from "../lib/types";
import { FilterMenu } from "./FilterMenu";
import { ProgressBar } from "./ProgressBar";

export function SheetToolbar({
  isMobile,
  stats,
  difficultyBreakdown,
  preference,
  onThemeChange,
  optionalColumnVisibility,
  onOptionalColumnChange,
  onRequestReset,
  diffFilter,
  onDiffFilterChange,
  statusFilter,
  onStatusFilterChange,
  revOnly,
  onRevOnlyToggle,
  hasActiveProblemFilters,
  onClearFilters,
  search,
  onSearchChange,
  searchInputRef,
  flashRef,
}: {
  isMobile: boolean;
  stats: SheetStats;
  difficultyBreakdown: DifficultyBreakdownRow[];
  preference: ThemePreference;
  onThemeChange: (preference: ThemePreference) => void;
  optionalColumnVisibility: OptionalSheetColumnVisibility;
  onOptionalColumnChange: (key: OptionalSheetColumnKey, checked: boolean) => void;
  onRequestReset: () => void;
  diffFilter: string;
  onDiffFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  revOnly: boolean;
  onRevOnlyToggle: () => void;
  hasActiveProblemFilters: boolean;
  onClearFilters: () => void;
  search: string;
  onSearchChange: Dispatch<SetStateAction<string>>;
  searchInputRef: RefObject<HTMLInputElement | null>;
  flashRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:rounded-3xl">
      <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-7">
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
                  onValueChange={(v) => onThemeChange(v as ThemePreference)}
                >
                  {THEME_PREFERENCE_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt}
                      value={opt}
                      className="cursor-pointer gap-2 text-sm"
                    >
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
              <DropdownMenuContent
                align={isMobile ? "start" : "end"}
                sideOffset={8}
                collisionPadding={12}
                className="w-64 max-w-[calc(100vw-1.5rem)]"
              >
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Preferences
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-sm"
                  onSelect={onRequestReset}
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
                  Choose which optional columns appear in the problem sheet. LeetCode and Others
                  always stay on.
                </p>
                {OPTIONAL_SHEET_COLUMNS_IN_ORDER.map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    className="text-sm"
                    checked={optionalColumnVisibility[key]}
                    onCheckedChange={(checked) => onOptionalColumnChange(key, checked === true)}
                  >
                    {OPTIONAL_SHEET_COLUMN_LABEL[key]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

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
                <span
                  className={cn("size-2 shrink-0 rounded-full", DIFFICULTY_DOT_CLASS[key])}
                  aria-hidden
                />
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

        <div
          ref={flashRef}
          className="flex flex-col gap-2.5 border-t border-border/50 pt-4 sm:flex-row sm:flex-wrap sm:items-center"
        >
          <div className="flex flex-wrap items-center gap-2">
            <FilterMenu
              value={diffFilter}
              onChange={onDiffFilterChange}
              options={["All", "Easy", "Medium", "Hard"]}
              allLabel="All Difficulty"
              icon={<ListFilter className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />}
            />
            <FilterMenu
              value={statusFilter}
              onChange={onStatusFilterChange}
              options={["All", "Solved", "Unsolved"]}
              allLabel="All Status"
              icon={<Clock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />}
            />
            <button
              type="button"
              onClick={onRevOnlyToggle}
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
                    revOnly ? "bg-primary text-primary-foreground" : "bg-amber-500 text-white",
                  )}
                >
                  {stats.revCount > 99 ? "99+" : stats.revCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              disabled={!hasActiveProblemFilters}
              onClick={onClearFilters}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-muted-foreground touch-manipulation",
                hasActiveProblemFilters
                  ? "cursor-pointer hover:bg-muted hover:text-foreground"
                  : "cursor-not-allowed opacity-40",
              )}
              title={
                hasActiveProblemFilters
                  ? "Clear difficulty, status, revision-only, and search"
                  : "No filters applied"
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
              onChange={(e) => onSearchChange(e.target.value)}
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
  );
}
