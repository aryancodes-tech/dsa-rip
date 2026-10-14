/**
 * Shared text / code note blocks used by the Notes modal and the release-notes preview.
 */
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DSA_NOTE_CODE_HIGHLIGHT_CLASS,
  DSA_NOTE_CODE_MIN_H_CLASS,
  DSA_NOTE_CODE_PLACEHOLDER,
  DSA_NOTE_CODE_TAB_SPACES,
  DSA_NOTE_COPIED_LABEL,
  DSA_NOTE_COPY_LABEL,
  DSA_NOTE_LANGUAGE_LABEL,
  DSA_NOTE_LANGUAGES,
  DSA_NOTE_REMOVE_LABEL,
  DSA_NOTE_TEXT_MIN_H_CLASS,
  DSA_NOTE_TEXT_PLACEHOLDER,
  isDsaNoteLanguageId,
  type DsaNoteLanguageId,
} from "@/constants/notes";
import type { NoteEditorBlock } from "@/lib/note-blocks";
import { highlightNoteCode } from "@/lib/note-syntax-highlight";

type TextBlock = Extract<NoteEditorBlock, { type: "text" }>;
type CodeBlock = Extract<NoteEditorBlock, { type: "code" }>;

export function TextNoteBlock({
  block,
  autoFocus = false,
  canRemove,
  readOnly = false,
  compact = false,
  onChange,
  onRemove,
}: {
  block: TextBlock;
  autoFocus?: boolean;
  canRemove: boolean;
  /** Display-only (release notes preview). */
  readOnly?: boolean;
  /** Shorter min height for tight dialogs. */
  compact?: boolean;
  onChange?: (content: string) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="group relative rounded-xl border border-border bg-muted/40">
      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-1.5">
        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
          Text
        </span>
        {!readOnly && canRemove && onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[0.6875rem] text-muted-foreground hover:bg-muted hover:text-foreground touch-manipulation"
            aria-label={DSA_NOTE_REMOVE_LABEL}
          >
            <Trash2 className="size-3" aria-hidden />
            {DSA_NOTE_REMOVE_LABEL}
          </button>
        ) : null}
      </div>
      {readOnly ? (
        <div
          className={cn(
            "whitespace-pre-wrap p-3 text-sm leading-relaxed text-foreground",
            compact ? "min-h-16" : DSA_NOTE_TEXT_MIN_H_CLASS,
          )}
        >
          {block.content.length > 0 ? block.content : DSA_NOTE_TEXT_PLACEHOLDER}
        </div>
      ) : (
        <textarea
          value={block.content}
          onChange={(e) => onChange?.(e.target.value)}
          autoFocus={autoFocus}
          placeholder={DSA_NOTE_TEXT_PLACEHOLDER}
          className={cn(
            "w-full cursor-text resize-y rounded-b-xl bg-transparent p-3 text-sm leading-relaxed focus:outline-none",
            compact ? "min-h-16" : DSA_NOTE_TEXT_MIN_H_CLASS,
          )}
        />
      )}
    </div>
  );
}

export function CodeNoteBlock({
  block,
  canRemove,
  readOnly = false,
  compact = false,
  onChangeContent,
  onChangeLanguage,
  onRemove,
}: {
  block: CodeBlock;
  canRemove: boolean;
  readOnly?: boolean;
  compact?: boolean;
  onChangeContent?: (content: string) => void;
  onChangeLanguage?: (language: DsaNoteLanguageId) => void;
  onRemove?: () => void;
}) {
  const langSelectId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const lineCount = Math.max(1, block.content.split("\n").length);
  const visibleRows = Math.max(compact ? 6 : 10, lineCount);
  const lineLabels = Array.from({ length: visibleRows }, (_, i) => String(i + 1)).join("\n");
  const highlightedHtml = useMemo(
    () => highlightNoteCode(block.content, block.language),
    [block.content, block.language],
  );
  const showHighlight = block.content.length > 0;

  const handleCopy = async () => {
    if (block.content.length === 0) return;
    try {
      await navigator.clipboard.writeText(block.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard may be denied */
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab" || readOnly) return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const tab = " ".repeat(DSA_NOTE_CODE_TAB_SPACES);
    const next = `${block.content.slice(0, start)}${tab}${block.content.slice(end)}`;
    onChangeContent?.(next);
    requestAnimationFrame(() => {
      const node = textareaRef.current;
      if (node === null) return;
      const pos = start + tab.length;
      node.selectionStart = pos;
      node.selectionEnd = pos;
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-muted/50 px-3 py-1.5">
        <div className="relative inline-flex items-center">
          <label htmlFor={langSelectId} className="sr-only">
            {DSA_NOTE_LANGUAGE_LABEL}
          </label>
          {readOnly ? (
            <span className="inline-flex h-7 items-center rounded-md border border-border bg-card px-2.5 text-xs font-medium text-foreground">
              {DSA_NOTE_LANGUAGES.find((l) => l.id === block.language)?.label ?? block.language}
            </span>
          ) : (
            <>
              <select
                id={langSelectId}
                value={block.language}
                onChange={(e) => {
                  const next = e.target.value;
                  if (isDsaNoteLanguageId(next)) onChangeLanguage?.(next);
                }}
                className="h-7 cursor-pointer appearance-none rounded-md border border-border bg-card py-0 pl-2.5 pr-7 text-xs font-medium leading-none text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {DSA_NOTE_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </>
          )}
        </div>
        {!readOnly ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              disabled={block.content.length === 0}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[0.6875rem] text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 touch-manipulation"
            >
              {copied ? (
                <Check className="size-3 text-primary" aria-hidden />
              ) : (
                <Copy className="size-3" aria-hidden />
              )}
              {copied ? DSA_NOTE_COPIED_LABEL : DSA_NOTE_COPY_LABEL}
            </button>
            {canRemove && onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[0.6875rem] text-muted-foreground hover:bg-muted hover:text-foreground touch-manipulation"
                aria-label={DSA_NOTE_REMOVE_LABEL}
              >
                <Trash2 className="size-3" aria-hidden />
                {DSA_NOTE_REMOVE_LABEL}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className={cn("flex", compact ? "min-h-0" : DSA_NOTE_CODE_MIN_H_CLASS)}>
        <pre
          aria-hidden
          className="select-none border-r border-border/60 bg-muted/40 px-2 py-3 text-right font-mono text-[0.75rem] leading-5 text-muted-foreground/80"
        >
          {lineLabels}
        </pre>
        <div className="relative min-w-0 flex-1">
          {readOnly ? (
            <pre
              className={cn(
                DSA_NOTE_CODE_HIGHLIGHT_CLASS,
                "overflow-hidden p-3 font-mono text-[0.8125rem] leading-5",
              )}
              dangerouslySetInnerHTML={{
                __html: highlightedHtml + (block.content.endsWith("\n") ? "\n" : ""),
              }}
            />
          ) : (
            <>
              {showHighlight ? (
                <pre
                  aria-hidden
                  className={cn(
                    DSA_NOTE_CODE_HIGHLIGHT_CLASS,
                    "pointer-events-none absolute inset-0 overflow-hidden p-3 font-mono text-[0.8125rem] leading-5",
                  )}
                  dangerouslySetInnerHTML={{
                    __html: highlightedHtml + (block.content.endsWith("\n") ? "\n" : ""),
                  }}
                />
              ) : null}
              <textarea
                ref={textareaRef}
                value={block.content}
                onChange={(e) => onChangeContent?.(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                rows={visibleRows}
                placeholder={DSA_NOTE_CODE_PLACEHOLDER}
                className={cn(
                  "relative w-full cursor-text resize-none overflow-hidden bg-transparent p-3 font-mono text-[0.8125rem] leading-5 focus:outline-none",
                  showHighlight && "text-transparent caret-foreground",
                )}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
