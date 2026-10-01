import { useEffect, useMemo, useState, type KeyboardEvent, type RefObject } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SHEET_SEARCH_LISTBOX_ID,
  SHEET_SEARCH_LISTBOX_LABEL,
  SHEET_SEARCH_MAX_SUGGESTIONS,
  SHEET_SEARCH_MENU_CLASS,
  SHEET_SEARCH_NO_RESULTS,
  SHEET_SEARCH_OPTION_ID_PREFIX,
  SHEET_SEARCH_PLACEHOLDER,
} from "@/constants/sheet-search";
import { collectSearchSuggestions, type SheetSearchSuggestion } from "../lib/search";

/**
 * Combobox over problem titles. Selecting a row jumps the sheet to that problem.
 */
export function SearchProblemCombobox({
  query,
  onQueryChange,
  onSelect,
  inputRef,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (suggestion: SheetSearchSuggestion) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const suggestions = useMemo(
    () => collectSearchSuggestions(query, SHEET_SEARCH_MAX_SUGGESTIONS),
    [query],
  );
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const trimmed = query.trim();
  const listOpen = focused && trimmed.length > 0;
  const activeId =
    listOpen && suggestions.length > 0
      ? `${SHEET_SEARCH_OPTION_ID_PREFIX}${activeIndex}`
      : undefined;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!listOpen || suggestions.length === 0) return;
    const list = document.getElementById(SHEET_SEARCH_LISTBOX_ID);
    const el = document.getElementById(`${SHEET_SEARCH_OPTION_ID_PREFIX}${activeIndex}`);
    if (list === null || el === null) return;
    const listRect = list.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.bottom > listRect.bottom) {
      list.scrollTop += elRect.bottom - listRect.bottom;
    } else if (elRect.top < listRect.top) {
      list.scrollTop -= listRect.top - elRect.top;
    }
  }, [activeIndex, listOpen, suggestions.length]);

  const moveActive = (delta: number) => {
    if (suggestions.length === 0) return;
    setActiveIndex((i) => (i + delta + suggestions.length) % suggestions.length);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!listOpen) return;
      moveActive(1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!listOpen) return;
      moveActive(-1);
      return;
    }
    if (e.key === "Enter") {
      if (!listOpen || suggestions.length === 0) return;
      e.preventDefault();
      const pick = suggestions[activeIndex] ?? suggestions[0];
      if (pick !== undefined) {
        onSelect(pick);
        setFocused(false);
        inputRef.current?.blur();
      }
      return;
    }
    if (e.key === "Escape") {
      if (!listOpen) return;
      e.preventDefault();
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      className="relative z-30 w-full min-w-0 overflow-visible sm:ml-auto sm:min-w-[16rem] sm:max-w-md sm:flex-1"
      data-tour="search"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value);
          setFocused(true);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
        placeholder={SHEET_SEARCH_PLACEHOLDER}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={listOpen}
        aria-controls={listOpen ? SHEET_SEARCH_LISTBOX_ID : undefined}
        aria-activedescendant={activeId}
        autoComplete="off"
        className="min-h-10 w-full cursor-text rounded-xl border border-border/80 bg-background/80 py-2 pl-9 pr-3 text-base shadow-sm sm:min-h-0 sm:pr-14 sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none rounded-md border border-border bg-muted/80 px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:inline-block">
        ⌘ K
      </kbd>
      {listOpen ? (
        <ul
          id={SHEET_SEARCH_LISTBOX_ID}
          role="listbox"
          aria-label={SHEET_SEARCH_LISTBOX_LABEL}
          className={SHEET_SEARCH_MENU_CLASS}
        >
          {suggestions.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-muted-foreground">{SHEET_SEARCH_NO_RESULTS}</li>
          ) : (
            suggestions.map((suggestion, index) => {
              const selected = index === activeIndex;
              return (
                <li key={suggestion.problem.id} role="none">
                  <button
                    type="button"
                    id={`${SHEET_SEARCH_OPTION_ID_PREFIX}${index}`}
                    role="option"
                    aria-selected={selected}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      onSelect(suggestion);
                      setFocused(false);
                      inputRef.current?.blur();
                    }}
                    className={cn(
                      "flex w-full cursor-pointer flex-col items-start gap-0.5 px-3 py-2 text-left",
                      selected ? "bg-muted" : "hover:bg-muted/70",
                    )}
                  >
                    <span className="w-full truncate text-sm font-medium text-foreground">
                      {suggestion.problem.title}
                    </span>
                    {suggestion.sectionLabel.length > 0 ? (
                      <span className="w-full truncate text-[11px] leading-tight text-muted-foreground">
                        {suggestion.sectionLabel}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
