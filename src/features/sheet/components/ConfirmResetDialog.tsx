import { useState } from "react";
import { motion } from "framer-motion";

export function ConfirmResetDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (keepNotes: boolean) => void;
}) {
  const [keep, setKeep] = useState(true);
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
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border"
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-2xl">Reset all progress?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          This clears completed and revision-marked questions. This cannot be undone.
        </p>
        <label className="mt-4 flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={keep}
            onChange={(e) => setKeep(e.target.checked)}
            className="accent-primary"
          />
          Keep my notes
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(keep)}
            className="cursor-pointer px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:opacity-90"
          >
            Reset
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
