import { X_LOGO_SVG_PATH_D } from "@/constants/creator";

/**
 * Compact X (Twitter) mark. Color follows `currentColor`.
 */
export function XLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
    >
      <path d={X_LOGO_SVG_PATH_D} />
    </svg>
  );
}
