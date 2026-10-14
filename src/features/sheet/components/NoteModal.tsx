import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Type, X } from "lucide-react";
import type { Problem } from "@/data/sheet";
import { notesStore } from "@/lib/tracker-store";
import { cn } from "@/lib/utils";
import {
  DSA_NOTE_ADD_CODE_LABEL,
  DSA_NOTE_ADD_TEXT_LABEL,
  DSA_NOTE_AUTOSAVE_HINT,
  DSA_NOTE_AUTOSAVE_MS,
  DSA_NOTE_BLOCKS_SCROLL_CLASS,
  DSA_NOTE_DEFAULT_LANGUAGE,
  DSA_NOTE_MAX_CHARS,
  DSA_NOTE_MODAL_CLASS,
  DSA_NOTE_NEAR_LIMIT_CHARS,
} from "@/constants/notes";
import {
  createEmptyNoteEditorBlocks,
  createNoteBlockId,
  isNoteBlocksEmpty,
  parseNoteToEditorBlocks,
  serializeNoteBlocks,
  type NoteEditorBlock,
} from "@/lib/note-blocks";
import { CodeNoteBlock, TextNoteBlock } from "@/features/sheet/components/NoteBlocks";

export function NoteModal({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  const stored = notesStore.getValue(problem.id);
  const [blocks, setBlocks] = useState<NoteEditorBlock[]>(() =>
    stored.length === 0 ? createEmptyNoteEditorBlocks() : parseNoteToEditorBlocks(stored),
  );
  const [limitHit, setLimitHit] = useState(false);

  const serialized = serializeNoteBlocks(blocks);
  const charCount = serialized.length;
  const remaining = DSA_NOTE_MAX_CHARS - charCount;
  const nearLimit = remaining <= DSA_NOTE_NEAR_LIMIT_CHARS;

  useEffect(() => {
    const t = setTimeout(() => {
      notesStore.set(problem.id, isNoteBlocksEmpty(blocks) ? "" : serialized);
    }, DSA_NOTE_AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [serialized, blocks, problem.id]);

  const tryCommit = (next: NoteEditorBlock[]): boolean => {
    const nextSerialized = serializeNoteBlocks(next);
    if (nextSerialized.length > DSA_NOTE_MAX_CHARS) {
      setLimitHit(true);
      return false;
    }
    setLimitHit(false);
    setBlocks(next);
    return true;
  };

  const updateBlock = (id: string, patch: Partial<NoteEditorBlock>) => {
    tryCommit(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as NoteEditorBlock) : b)));
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) {
      tryCommit(createEmptyNoteEditorBlocks());
      return;
    }
    const next = blocks.filter((b) => b.id !== id);
    tryCommit(next.length === 0 ? createEmptyNoteEditorBlocks() : next);
  };

  const addTextBlock = () => {
    tryCommit([...blocks, { id: createNoteBlockId(), type: "text", content: "" }]);
  };

  const addCodeBlock = () => {
    tryCommit([
      ...blocks,
      {
        id: createNoteBlockId(),
        type: "code",
        language: DSA_NOTE_DEFAULT_LANGUAGE,
        content: "",
      },
    ]);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-modal-title"
        className={DSA_NOTE_MODAL_CLASS}
        initial={{ scale: 0.98, y: 6 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.98, y: 6 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Notes</p>
            <h3
              id="note-modal-title"
              className="font-display mt-1 pr-2 text-lg leading-snug sm:text-xl"
            >
              {problem.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md touch-manipulation hover:bg-muted"
            aria-label="Close notes"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className={DSA_NOTE_BLOCKS_SCROLL_CLASS}>
          {blocks.map((block, index) =>
            block.type === "text" ? (
              <TextNoteBlock
                key={block.id}
                block={block}
                autoFocus={index === 0 && block.content.length === 0}
                canRemove={blocks.length > 1 || block.content.length > 0}
                onChange={(content) => updateBlock(block.id, { content })}
                onRemove={() => removeBlock(block.id)}
              />
            ) : (
              <CodeNoteBlock
                key={block.id}
                block={block}
                canRemove={blocks.length > 1 || block.content.length > 0}
                onChangeContent={(content) => updateBlock(block.id, { content })}
                onChangeLanguage={(language) => updateBlock(block.id, { language })}
                onRemove={() => removeBlock(block.id)}
              />
            ),
          )}
        </div>

        <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addTextBlock}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted touch-manipulation"
            >
              <Type className="size-3.5 opacity-70" aria-hidden />
              {DSA_NOTE_ADD_TEXT_LABEL}
            </button>
            <button
              type="button"
              onClick={addCodeBlock}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted touch-manipulation"
            >
              <Code2 className="size-3.5 opacity-70" aria-hidden />
              {DSA_NOTE_ADD_CODE_LABEL}
            </button>
            <p className="text-xs text-muted-foreground">{DSA_NOTE_AUTOSAVE_HINT}</p>
          </div>
          <p
            className={cn(
              "tabular-nums text-xs text-muted-foreground",
              nearLimit && "font-medium text-foreground",
              (remaining === 0 || limitHit) && "text-destructive",
            )}
            aria-live="polite"
          >
            {charCount.toLocaleString()} / {DSA_NOTE_MAX_CHARS.toLocaleString()}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
