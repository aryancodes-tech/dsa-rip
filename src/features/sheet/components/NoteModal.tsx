import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Problem } from "@/data/sheet";
import { notesStore } from "@/lib/tracker-store";
import { cn } from "@/lib/utils";
import { DSA_NOTE_MAX_CHARS } from "@/constants/creator";

export function NoteModal({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  const stored = notesStore.getValue(problem.id);
  const [val, setVal] = useState(
    stored.length > DSA_NOTE_MAX_CHARS ? stored.slice(0, DSA_NOTE_MAX_CHARS) : stored,
  );

  useEffect(() => {
    const t = setTimeout(() => notesStore.set(problem.id, val), 300);
    return () => clearTimeout(t);
  }, [val, problem.id]);

  const remaining = DSA_NOTE_MAX_CHARS - val.length;
  const nearLimit = remaining <= 200;

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
        className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-border"
        initial={{ scale: 0.98, y: 6 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.98, y: 6 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Notes</p>
            <h3 className="font-display mt-1 pr-2 text-lg leading-snug sm:text-xl">{problem.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md touch-manipulation hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <textarea
          value={val}
          onChange={(e) => {
            const next = e.target.value;
            setVal(next.length > DSA_NOTE_MAX_CHARS ? next.slice(0, DSA_NOTE_MAX_CHARS) : next);
          }}
          autoFocus
          maxLength={DSA_NOTE_MAX_CHARS}
          placeholder="Approach, complexity, tricks…"
          className="h-48 w-full cursor-text resize-none rounded-lg border border-border bg-muted/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>Auto-saved locally in this browser.</p>
          <p
            className={cn(
              "tabular-nums",
              nearLimit && "font-medium text-foreground",
              remaining === 0 && "text-destructive",
            )}
            aria-live="polite"
          >
            {val.length.toLocaleString()} / {DSA_NOTE_MAX_CHARS.toLocaleString()}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
