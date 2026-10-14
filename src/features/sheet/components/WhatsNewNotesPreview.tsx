/**
 * Live Notes editor preview for the release-notes dialog (same blocks as the real modal).
 */
import { CodeNoteBlock, TextNoteBlock } from "@/features/sheet/components/NoteBlocks";
import {
  DSA_WHATS_NEW_NOTES_PREVIEW_CODE,
  DSA_WHATS_NEW_NOTES_PREVIEW_FRAME_CLASS,
  DSA_WHATS_NEW_NOTES_PREVIEW_LANGUAGE,
  DSA_WHATS_NEW_NOTES_PREVIEW_PROBLEM_TITLE,
  DSA_WHATS_NEW_NOTES_PREVIEW_TEXT,
} from "@/constants/whats-new";

export function WhatsNewNotesPreview() {
  return (
    <div className={DSA_WHATS_NEW_NOTES_PREVIEW_FRAME_CLASS} aria-hidden>
      <div className="mb-2.5">
        <p className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
          Notes
        </p>
        <p className="font-display text-sm font-semibold leading-snug text-foreground">
          {DSA_WHATS_NEW_NOTES_PREVIEW_PROBLEM_TITLE}
        </p>
      </div>
      <div className="space-y-2.5">
        <TextNoteBlock
          block={{ id: "preview-text", type: "text", content: DSA_WHATS_NEW_NOTES_PREVIEW_TEXT }}
          canRemove={false}
          readOnly
          compact
        />
        <CodeNoteBlock
          block={{
            id: "preview-code",
            type: "code",
            language: DSA_WHATS_NEW_NOTES_PREVIEW_LANGUAGE,
            content: DSA_WHATS_NEW_NOTES_PREVIEW_CODE,
          }}
          canRemove={false}
          readOnly
          compact
        />
      </div>
    </div>
  );
}
