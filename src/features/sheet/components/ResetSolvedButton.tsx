/**
 * Small header control that unchecks Status for every problem in a step or sub-step.
 * Intentionally does not clear revision stars or notes.
 */

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { SHEET_RESET_SOLVED_TOOLTIP } from "@/constants/sheet-progress";
import { cn } from "@/lib/utils";
import { ConfirmResetSolvedDialog } from "./ConfirmResetSolvedDialog";

export function ResetSolvedButton({
  disabled,
  ariaLabel,
  onReset,
}: {
  disabled: boolean;
  ariaLabel: string;
  onReset: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={(e) => {
          e.stopPropagation();
          setConfirmOpen(true);
        }}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md touch-manipulation [-webkit-tap-highlight-color:transparent]",
          disabled
            ? "cursor-default text-muted-foreground/30"
            : "cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <RotateCcw className="size-3.5" aria-hidden />
      </button>
      {!confirmOpen && !disabled ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute top-1/2 right-full z-20 mr-1.5 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        >
          {SHEET_RESET_SOLVED_TOOLTIP}
        </span>
      ) : null}
      <AnimatePresence>
        {confirmOpen ? (
          <ConfirmResetSolvedDialog
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => {
              setConfirmOpen(false);
              onReset();
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
