/**
 * takeUforward (TUF) practice-platform URLs shown in the always-on TUF sheet column.
 */

/** Public origin for takeUforward. */
export const TUF_ORIGIN = "https://takeuforward.org";

/** Path prefix for TUF DSA practice problems (item slug appended). */
export const TUF_PRACTICE_DSA_PATH = "/practice/dsa";

/** Path prefix for TUF DSA learning items (item slug appended). */
export const TUF_LEARNING_DSA_PATH = "/learning/dsa";

/**
 * Builds a TUF practice URL from a syllabus item slug
 * (e.g. `infix-to-postfix-conversion` →
 * `https://takeuforward.org/practice/dsa/infix-to-postfix-conversion`).
 */
export function composeTufPracticeUrl(itemSlug: string): string {
  if (itemSlug.length === 0) return "";
  return `${TUF_ORIGIN}${TUF_PRACTICE_DSA_PATH}/${encodeURIComponent(itemSlug)}`;
}

/**
 * Builds a TUF learning URL from a syllabus item slug
 * (e.g. `learn-cpp` → `https://takeuforward.org/learning/dsa/learn-cpp`).
 */
export function composeTufLearningUrl(itemSlug: string): string {
  if (itemSlug.length === 0) return "";
  return `${TUF_ORIGIN}${TUF_LEARNING_DSA_PATH}/${encodeURIComponent(itemSlug)}`;
}
