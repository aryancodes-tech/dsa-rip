/**
 * Selectable tracker themes. Persisted under `DSA_LS_KEYS.theme`.
 * New visitors get Light; there is no OS-follow option.
 */

/** Menu selection and persisted theme. */
export type ThemePreference = "light" | "dark" | "lavender";

/** Palette applied to the document (`dark` / `lavender` classes, or neither for light). */
export type ResolvedTheme = ThemePreference;

/**
 * @deprecated Prefer {@link ResolvedTheme} for visuals and {@link ThemePreference} for storage.
 * Kept as an alias so existing imports that mean “resolved palette” keep compiling.
 */
export type AppTheme = ResolvedTheme;

/** Default preference when nothing valid is stored. */
export const DSA_THEME_DEFAULT: ThemePreference = "light";

/**
 * Single-letter wire format in `localStorage` (`l` | `d` | `v`).
 */
export const DSA_THEME_WIRE: Record<ThemePreference, string> = {
  light: "l",
  dark: "d",
  lavender: "v",
} as const;

/** Retired OS-follow wire letter; treated as {@link DSA_THEME_DEFAULT}. */
export const DSA_THEME_LEGACY_SYSTEM_WIRE = "s";

/** Retired OS-follow full name; treated as {@link DSA_THEME_DEFAULT}. */
export const DSA_THEME_LEGACY_SYSTEM_NAME = "system";

/** Pre-wire full names still accepted when reading `localStorage`. */
export const DSA_THEME_LEGACY_FULL_NAME: Record<ThemePreference, string> = {
  light: "light",
  dark: "dark",
  lavender: "lavender",
};

/** Menu order for the custom theme dropdown. */
export const THEME_PREFERENCE_OPTIONS: readonly ThemePreference[] = [
  "light",
  "dark",
  "lavender",
] as const;

/** Human labels for {@link THEME_PREFERENCE_OPTIONS}. */
export const THEME_PREFERENCE_LABEL: Record<ThemePreference, string> = {
  light: "Light",
  dark: "Dark",
  lavender: "Lavender",
};

/**
 * Trims a stored theme token. Empty after trim is treated as missing.
 */
export function canonicalStoredThemeToken(value: string | null): string {
  if (value === null || value.length === 0) return "";
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed;
}

/**
 * Retired System preference: wire `s` or full name `system` (any case / surrounding space).
 * These users used to follow the OS; they now become Light.
 */
export function isLegacySystemThemeStored(value: string | null): boolean {
  const token = canonicalStoredThemeToken(value);
  if (token.length === 0) return false;
  const lower = token.toLowerCase();
  return lower === DSA_THEME_LEGACY_SYSTEM_WIRE || lower === DSA_THEME_LEGACY_SYSTEM_NAME;
}

/**
 * Maps a stored `localStorage` token to a selectable theme.
 * Empty, unknown, and retired System tokens become {@link DSA_THEME_DEFAULT}.
 */
export function normalizeThemeStored(value: string | null): ThemePreference {
  const token = canonicalStoredThemeToken(value);
  if (token.length === 0) return DSA_THEME_DEFAULT;
  if (isLegacySystemThemeStored(token)) return DSA_THEME_DEFAULT;
  const lower = token.toLowerCase();
  if (lower === DSA_THEME_WIRE.dark || lower === DSA_THEME_LEGACY_FULL_NAME.dark) return "dark";
  if (lower === DSA_THEME_WIRE.lavender || lower === DSA_THEME_LEGACY_FULL_NAME.lavender) {
    return "lavender";
  }
  if (lower === DSA_THEME_WIRE.light || lower === DSA_THEME_LEGACY_FULL_NAME.light) return "light";
  return DSA_THEME_DEFAULT;
}

/**
 * Compact token written to `localStorage` for a selectable theme.
 */
export function themeToWire(mode: ThemePreference): string {
  return DSA_THEME_WIRE[mode];
}

/**
 * Whether a stored token should be rewritten to the current wire form.
 * Covers retired System values and pre-wire full names.
 */
export function themeStoredNeedsRewrite(raw: string | null): boolean {
  const token = canonicalStoredThemeToken(raw);
  if (token.length === 0) return false;
  if (isLegacySystemThemeStored(token)) return true;
  const lower = token.toLowerCase();
  if (lower === DSA_THEME_LEGACY_FULL_NAME.light) return true;
  if (lower === DSA_THEME_LEGACY_FULL_NAME.dark) return true;
  if (lower === DSA_THEME_LEGACY_FULL_NAME.lavender) return true;
  return false;
}

/**
 * One-shot storage migration: apply the current theme, and persist Light (`l`)
 * when the visitor still has a retired System token so they no longer follow the OS.
 * `persistWire` is null when storage should be left as-is (missing key or already current).
 */
export function migrateStoredTheme(raw: string | null): {
  preference: ThemePreference;
  persistWire: string | null;
} {
  const preference = normalizeThemeStored(raw);
  if (!themeStoredNeedsRewrite(raw)) {
    return { preference, persistWire: null };
  }
  return { preference, persistWire: themeToWire(preference) };
}
