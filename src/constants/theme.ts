/**
 * Theme preference (what the user picks) vs resolved visual theme (what `<html>` classes use).
 * Persisted under `DSA_LS_KEYS.theme`.
 */

/** Stored / menu selection - default is follow OS. */
export type ThemePreference = "system" | "light" | "dark" | "lavender";

/** Concrete palette applied to the document (`dark` / `lavender` classes, or neither for light). */
export type ResolvedTheme = "light" | "dark" | "lavender";

/**
 * @deprecated Prefer {@link ResolvedTheme} for visuals and {@link ThemePreference} for storage.
 * Kept as an alias so existing imports that mean “resolved palette” keep compiling.
 */
export type AppTheme = ResolvedTheme;

/** Default preference when nothing valid is stored. */
export const DSA_THEME_DEFAULT: ThemePreference = "system";

/**
 * Single-letter wire format in `localStorage` (`s` | `l` | `d` | `v`).
 */
export const DSA_THEME_WIRE: Record<ThemePreference, string> = {
  system: "s",
  light: "l",
  dark: "d",
  lavender: "v",
} as const;

/** Menu order for the custom theme dropdown. */
export const THEME_PREFERENCE_OPTIONS: readonly ThemePreference[] = [
  "system",
  "light",
  "dark",
  "lavender",
] as const;

/** Human labels for {@link THEME_PREFERENCE_OPTIONS}. */
export const THEME_PREFERENCE_LABEL: Record<ThemePreference, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
  lavender: "Lavender",
};

/**
 * Maps a stored preference to the palette that should paint the UI.
 * `systemDark` comes from `prefers-color-scheme: dark`.
 */
export function resolveThemePreference(
  preference: ThemePreference,
  systemDark: boolean,
): ResolvedTheme {
  if (preference === "system") return systemDark ? "dark" : "light";
  return preference;
}
