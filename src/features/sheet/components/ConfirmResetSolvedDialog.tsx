import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  SHEET_RESET_SOLVED_CONFIRM_ACTION,
  SHEET_RESET_SOLVED_CONFIRM_BODY,
  SHEET_RESET_SOLVED_CONFIRM_CANCEL,
  SHEET_RESET_SOLVED_CONFIRM_TITLE,
} from "@/constants/sheet-progress";

/**
 * Confirms a per-step / per-sub-step reset: Status checkboxes only.
 */
export function ConfirmResetSolvedDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-solved-title"
        aria-describedby="reset-solved-body"
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border"
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="reset-solved-title" className="font-display text-2xl">
          {SHEET_RESET_SOLVED_CONFIRM_TITLE}
        </h3>
        <p id="reset-solved-body" className="mt-2 text-sm text-muted-foreground">
          {SHEET_RESET_SOLVED_CONFIRM_BODY}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted"
          >
            {SHEET_RESET_SOLVED_CONFIRM_CANCEL}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:opacity-90"
          >
            {SHEET_RESET_SOLVED_CONFIRM_ACTION}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
