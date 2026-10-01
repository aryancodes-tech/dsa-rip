import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FILTER_MENU_TRIGGER_WIDTH_CLASS, FILTER_TRIGGER_CLASS } from "../lib/toolbar-classes";

/**
 * Styled filter menu (replaces native `<select>` so Difficulty / Status match the rest of the UI).
 */
export function FilterMenu({
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
        <button
          type="button"
          className={cn(
            FILTER_TRIGGER_CLASS,
            FILTER_MENU_TRIGGER_WIDTH_CLASS,
            "justify-between gap-2",
          )}
        >
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
