import { useEffect, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DSA_PRODUCT_DISPLAY_NAME } from "@/constants/creator";
import { LOGO_DSA_RIP_SPLASH_CLASS, LOGO_DSA_RIP_SPLASH_PATH } from "@/constants/branding";
import {
  DSA_SPLASH_DARK_LOGO_MAT_BG,
  DSA_SPLASH_DARK_LOGO_MAT_CLASS,
  DSA_SPLASH_EXIT_MS,
  DSA_SPLASH_TAGLINE,
  splashHoldMs,
} from "@/constants/splash";
import { DIFFICULTY_DOT_CLASS } from "../lib/difficulty-styles";

const SPLASH_DARK_LOGO_MAT_STYLE = {
  "--dsa-splash-dark-logo-mat": DSA_SPLASH_DARK_LOGO_MAT_BG,
} as CSSProperties;

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
            className={DSA_SPLASH_DARK_LOGO_MAT_CLASS}
            style={SPLASH_DARK_LOGO_MAT_STYLE}
            initial={instant ? false : { scale: 0.94 }}
            animate={{ scale: 1 }}
            transition={instant ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 24 }}
          >
            <img
              src={LOGO_DSA_RIP_SPLASH_PATH}
              alt={DSA_PRODUCT_DISPLAY_NAME}
              className={LOGO_DSA_RIP_SPLASH_CLASS}
            />
          </motion.div>

          <motion.p
            className="mt-4 max-w-xs text-center text-sm text-muted-foreground"
            initial={instant ? false : { y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={instant ? { duration: 0 } : { delay: 0.18, duration: 0.35 }}
          >
            {DSA_SPLASH_TAGLINE}
          </motion.p>

          <motion.div
            className="mt-6 flex items-center gap-2"
            aria-hidden
            initial={instant ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={instant ? { duration: 0 } : { delay: 0.28, duration: 0.3 }}
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
                    : { delay: 0.34 + i * 0.1, type: "spring", stiffness: 420, damping: 18 }
                }
              />
            ))}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
