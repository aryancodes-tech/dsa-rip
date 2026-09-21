import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Code2 } from "lucide-react";
import { DSA_PRODUCT_DISPLAY_NAME } from "@/constants/creator";
import { DSA_SPLASH_EXIT_MS, DSA_SPLASH_TAGLINE, splashHoldMs } from "@/constants/splash";
import { DIFFICULTY_DOT_CLASS } from "../lib/difficulty-styles";

const DIFFICULTY_KEYS = ["Easy", "Medium", "Hard"] as const;

/**
 * Full-viewport welcome overlay. Click, tap, or Escape to skip.
 */
export function SplashScreen({ open, onDismiss }: { open: boolean; onDismiss: () => void }) {
  const reduceMotion = useReducedMotion();
  const holdMs = splashHoldMs(reduceMotion === true);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onDismiss, holdMs);
    return () => window.clearTimeout(t);
  }, [open, holdMs, onDismiss]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  const instant = reduceMotion === true;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="dsa-splash"
          role="status"
          aria-label={`${DSA_PRODUCT_DISPLAY_NAME} is loading`}
          className="fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center bg-background px-6"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: instant ? 0.12 : DSA_SPLASH_EXIT_MS / 1000, ease: "easeOut" }}
          onClick={onDismiss}
        >
          <motion.div
            className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-sm sm:size-[4.5rem]"
            initial={instant ? false : { scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={instant ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 22 }}
          >
            <Code2 className="size-8 sm:size-9" strokeWidth={1.75} aria-hidden />
          </motion.div>

          <motion.h1
            className="font-display mt-5 text-2xl font-semibold tracking-tight sm:text-3xl"
            initial={instant ? false : { y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={instant ? { duration: 0 } : { delay: 0.12, duration: 0.35 }}
          >
            {DSA_PRODUCT_DISPLAY_NAME}
          </motion.h1>

          <motion.p
            className="mt-1.5 max-w-xs text-center text-sm text-muted-foreground"
            initial={instant ? false : { y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={instant ? { duration: 0 } : { delay: 0.22, duration: 0.35 }}
          >
            {DSA_SPLASH_TAGLINE}
          </motion.p>

          <motion.div
            className="mt-6 flex items-center gap-2"
            aria-hidden
            initial={instant ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={instant ? { duration: 0 } : { delay: 0.32, duration: 0.3 }}
          >
            {DIFFICULTY_KEYS.map((key, i) => (
              <motion.span
                key={key}
                className={`size-2 rounded-full ${DIFFICULTY_DOT_CLASS[key]}`}
                initial={instant ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={
                  instant
                    ? { duration: 0 }
                    : { delay: 0.38 + i * 0.1, type: "spring", stiffness: 420, damping: 18 }
                }
              />
            ))}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
