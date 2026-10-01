import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DSA_WHATS_NEW_CODE_CLASS,
  DSA_WHATS_NEW_CTA,
  DSA_WHATS_NEW_CTA_CLASS,
  DSA_WHATS_NEW_DIALOG_CLASS,
  DSA_WHATS_NEW_INTRO,
  DSA_WHATS_NEW_ITEMS,
  DSA_WHATS_NEW_LIST_CLASS,
  DSA_WHATS_NEW_TITLE,
  formatWhatsNewReleaseHeading,
  splitWhatsNewLine,
} from "@/constants/whats-new";

/**
 * Compact Keep-a-Changelog note. Escape, overlay, the icon, or the CTA dismiss it.
 */
export function WhatsNewDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const releaseHeading = formatWhatsNewReleaseHeading();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-label={DSA_WHATS_NEW_TITLE}
        className={DSA_WHATS_NEW_DIALOG_CLASS}
      >
        <div className="pr-8">
          <div className="flex items-center gap-2.5">
            <FileText className="size-5 shrink-0 text-foreground/70" aria-hidden />
            <DialogTitle className="font-display text-2xl font-semibold tracking-tight">
              {DSA_WHATS_NEW_TITLE}
            </DialogTitle>
          </div>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {DSA_WHATS_NEW_INTRO}
          </DialogDescription>
        </div>

        {releaseHeading.length > 0 ? (
          <p className="font-mono text-sm font-semibold tracking-tight text-foreground">
            {releaseHeading}
          </p>
        ) : null}

        <ul className={DSA_WHATS_NEW_LIST_CLASS}>
          {DSA_WHATS_NEW_ITEMS.map((item) => (
            <li key={item.line} className="flex gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden />
              <span>
                {splitWhatsNewLine(item.line).map((part, index) =>
                  part.code ? (
                    <code key={`${part.text}-${index}`} className={DSA_WHATS_NEW_CODE_CLASS}>
                      {part.text}
                    </code>
                  ) : (
                    <span key={`${part.text}-${index}`}>{part.text}</span>
                  ),
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="pt-1">
          <button type="button" className={DSA_WHATS_NEW_CTA_CLASS} onClick={() => onOpenChange(false)}>
            {DSA_WHATS_NEW_CTA}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
