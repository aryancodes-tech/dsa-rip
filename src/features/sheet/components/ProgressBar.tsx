import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Horizontal progress track; `className` / `fillClassName` adjust shape (e.g. flat top bar on cards).
 */
export function ProgressBar({
  value,
  className = "",
  fillClassName = "",
}: {
  value: number;
  className?: string;
  fillClassName?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-muted overflow-hidden", className)}>
      <motion.div
        className={cn("h-full rounded-full bg-primary", fillClassName)}
        initial={false}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </div>
  );
}
