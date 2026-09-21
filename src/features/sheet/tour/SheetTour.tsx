import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SHEET_TOUR_STEPS, type SheetTourStep, type SheetTourStepId } from "@/constants/tour";
import { cn } from "@/lib/utils";

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8;
/** Viewport width below which left/right coachmark placement is abandoned. */
const NARROW_VIEWPORT_PX = 640;
const POPOVER_MAX_WIDTH_PX = 320;
const POPOVER_APPROX_HEIGHT_PX = 200;

function queryTourTarget(id: SheetTourStepId): HTMLElement | null {
  return document.querySelector(`[data-tour="${id}"]`);
}

function measure(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

/**
 * Positions the coachmark card relative to the spotlight target.
 * Left/right placement falls back to bottom on narrow viewports.
 */
function computePopoverStyle(rect: Rect | null, step: SheetTourStep): CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const popW = Math.min(POPOVER_MAX_WIDTH_PX, vw - 24);
  const narrow = vw < NARROW_VIEWPORT_PX;

  if (!rect) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: popW };
  }

  const gap = 12;
  let placement = step.placement;
  if (
    (placement === "left" || placement === "right") &&
    (narrow || vw < popW + rect.width + gap + 24)
  ) {
    placement = "bottom";
  }

  let top = rect.top + rect.height + gap;
  let left = rect.left + rect.width / 2 - popW / 2;

  if (placement === "top") {
    top = rect.top - gap - POPOVER_APPROX_HEIGHT_PX;
  } else if (placement === "left") {
    top = rect.top;
    left = rect.left - popW - gap;
  } else if (placement === "right") {
    top = rect.top;
    left = rect.left + rect.width + gap;
  }

  if (top + POPOVER_APPROX_HEIGHT_PX > vh) {
    top = Math.max(12, rect.top - gap - POPOVER_APPROX_HEIGHT_PX);
  }
  if (top < 12) {
    top = Math.min(vh - POPOVER_APPROX_HEIGHT_PX, rect.top + rect.height + gap);
  }
  left = Math.max(12, Math.min(left, vw - popW - 12));

  /** Full-width card under the target on phones for easier reading. */
  if (narrow) {
    return { top, left: 12, width: vw - 24, transform: "none" };
  }

  return { top, left, width: popW };
}

/**
 * Full-screen coachmark tour: spotlight cutout + popover synced to `data-tour` targets.
 */
export function SheetTour({
  open,
  onClose,
  onStepChange,
}: {
  open: boolean;
  onClose: () => void;
  /** Fires when the active step changes (or `null` when the tour closes). */
  onStepChange?: (stepId: SheetTourStepId | null) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = SHEET_TOUR_STEPS[stepIndex];
  const total = SHEET_TOUR_STEPS.length;
  const isLast = stepIndex >= total - 1;

  useLayoutEffect(() => {
    onStepChange?.(open && step ? step.id : null);
  }, [open, step, onStepChange]);

  const refresh = useCallback(() => {
    if (!open || !step) {
      setRect(null);
      return;
    }
    const el = queryTourTarget(step.id);
    if (!el) {
      setRect(null);
      return;
    }
    const narrow = window.innerWidth < NARROW_VIEWPORT_PX;
    /** Avoid jumping a tall open settings menu on desktop; icon targets are fine to center. */
    if (!(step.id === "settings" && !narrow)) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setRect(measure(el));
      });
    });
  }, [open, step]);

  useEffect(() => {
    if (!open) {
      setStepIndex(0);
      setRect(null);
      return;
    }
    // Settings menu opens via onStepChange; wait for the portal before measuring.
    const delay = step?.id === "settings" ? 120 : 0;
    const t = window.setTimeout(refresh, delay);
    return () => window.clearTimeout(t);
  }, [open, stepIndex, refresh, step?.id]);

  useLayoutEffect(() => {
    if (!open) return;
    const onResize = () => refresh();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (isLast) onClose();
        else setStepIndex((i) => Math.min(i + 1, total - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStepIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isLast, total, onClose]);

  if (typeof document === "undefined") return null;

  const popoverStyle = step ? computePopoverStyle(rect, step) : undefined;

  return createPortal(
    <AnimatePresence>
      {open && step ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sheet-tour-title"
          aria-describedby="sheet-tour-body"
        >
          <div className="absolute inset-0" aria-hidden>
            {rect ? (
              <div
                className="absolute rounded-xl transition-[top,left,width,height] duration-200 ease-out"
                style={{
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-black/55" />
            )}
          </div>

          <div
            className={cn(
              "absolute z-[120] rounded-2xl border border-border bg-card p-4 shadow-2xl",
              "text-card-foreground",
            )}
            style={popoverStyle}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground tabular-nums">
              {stepIndex + 1} / {total}
            </p>
            <h2 id="sheet-tour-title" className="font-display mt-1 text-lg font-semibold tracking-tight">
              {step.title}
            </h2>
            <p id="sheet-tour-body" className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Skip
              </button>
              <div className="flex items-center gap-2">
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStepIndex((i) => i - 1)}
                    className="cursor-pointer rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
                  >
                    Back
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    if (isLast) onClose();
                    else setStepIndex((i) => i + 1);
                  }}
                  className="cursor-pointer rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
                >
                  {isLast ? "Done" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
