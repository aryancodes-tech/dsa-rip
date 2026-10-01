/** Shared height/chrome for Settings, Theme, and filter pills. */
export const FILTER_TRIGGER_CLASS =
  "cursor-pointer inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-medium shadow-sm hover:bg-muted touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-background";

/**
 * Difficulty / Status pills: fill a 2-col phone row, keep a readable min width on `sm+`.
 */
export const FILTER_MENU_TRIGGER_WIDTH_CLASS = "w-full min-w-0 sm:w-auto sm:min-w-[9.5rem]";

/** Square companion for Settings (same height as {@link FILTER_TRIGGER_CLASS}). */
export const TOOLBAR_ICON_BTN_CLASS =
  "cursor-pointer inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-xs shadow-sm hover:bg-muted touch-manipulation";

/**
 * Theme control: square icon on phones (matches Settings), labeled pill from `sm`.
 */
export const THEME_TRIGGER_CLASS =
  "cursor-pointer inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-xs shadow-sm hover:bg-muted touch-manipulation sm:w-auto sm:gap-1.5 sm:px-3 sm:font-medium";
