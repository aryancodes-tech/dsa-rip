import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Enlarged view for sheet row preview images (e.g. pattern diagrams). */
export function PatternDiagramDialog({
  open,
  onOpenChange,
  imageUrl,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  title: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(96vw,56rem)] max-w-[min(96vw,56rem)] gap-0 overflow-y-auto rounded-2xl p-4 sm:rounded-2xl sm:p-6">
        <DialogHeader className="space-y-1 pr-6 text-left">
          <DialogTitle className="font-display text-base leading-snug sm:text-lg">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enlarged pattern diagram. Close with the button or Escape.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3 flex justify-center rounded-xl border border-border/60 bg-white p-2 sm:p-4 dark:bg-zinc-950">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-auto max-h-[min(78vh,720px)] w-full max-w-full object-contain"
              loading="eager"
              decoding="async"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
