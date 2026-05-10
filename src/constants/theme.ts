/**
 * Visual theme for the tracker shell (background, primary, cards). Persisted under `DSA_LS_KEYS.theme`.
 */
export type AppTheme = "light" | "dark" | "lavender";

/** Default when nothing valid is stored. */
export const DSA_THEME_DEFAULT: AppTheme = "light";

/**
 * Single-letter wire format in `localStorage` (`l` | `d` | `v`).
 * @see themeToWire in tracker-store
 */
export const DSA_THEME_WIRE: Record<AppTheme, string> = {
  light: "l",
  dark: "d",
  lavender: "v",
} as const;

/** Order used by the header “cycle theme” control. */
export const APP_THEME_CYCLE_ORDER: readonly AppTheme[] = ["light", "dark", "lavender"];
