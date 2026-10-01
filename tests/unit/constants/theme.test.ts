import { describe, expect, it } from "vitest";
import {
  DSA_THEME_DEFAULT,
  DSA_THEME_LEGACY_FULL_NAME,
  DSA_THEME_LEGACY_SYSTEM_NAME,
  DSA_THEME_LEGACY_SYSTEM_WIRE,
  DSA_THEME_WIRE,
  THEME_PREFERENCE_OPTIONS,
  isLegacySystemThemeStored,
  migrateStoredTheme,
  normalizeThemeStored,
  themeStoredNeedsRewrite,
  themeToWire,
} from "@/constants/theme";

describe("DSA_THEME_DEFAULT", () => {
  it("is Light for new visitors", () => {
    expect(DSA_THEME_DEFAULT).toBe("light");
  });
});

describe("THEME_PREFERENCE_OPTIONS", () => {
  it("lists Light, Dark, and Lavender with no System option", () => {
    expect([...THEME_PREFERENCE_OPTIONS]).toEqual(["light", "dark", "lavender"]);
  });
});

describe("isLegacySystemThemeStored", () => {
  it("recognizes retired System tokens with any case or surrounding space", () => {
    expect(isLegacySystemThemeStored(DSA_THEME_LEGACY_SYSTEM_WIRE)).toBe(true);
    expect(isLegacySystemThemeStored(DSA_THEME_LEGACY_SYSTEM_NAME)).toBe(true);
    expect(isLegacySystemThemeStored("S")).toBe(true);
    expect(isLegacySystemThemeStored(" System ")).toBe(true);
    expect(isLegacySystemThemeStored(DSA_THEME_WIRE.light)).toBe(false);
    expect(isLegacySystemThemeStored(null)).toBe(false);
    expect(isLegacySystemThemeStored("")).toBe(false);
  });
});

describe("normalizeThemeStored", () => {
  it("returns Light for empty, unknown, and retired System tokens", () => {
    expect(normalizeThemeStored(null)).toBe("light");
    expect(normalizeThemeStored("")).toBe("light");
    expect(normalizeThemeStored("nope")).toBe("light");
    expect(normalizeThemeStored(DSA_THEME_LEGACY_SYSTEM_WIRE)).toBe("light");
    expect(normalizeThemeStored(DSA_THEME_LEGACY_SYSTEM_NAME)).toBe("light");
    expect(normalizeThemeStored(" s ")).toBe("light");
  });

  it("accepts current wire letters and pre-wire full names", () => {
    expect(normalizeThemeStored(DSA_THEME_WIRE.light)).toBe("light");
    expect(normalizeThemeStored(DSA_THEME_LEGACY_FULL_NAME.light)).toBe("light");
    expect(normalizeThemeStored(DSA_THEME_WIRE.dark)).toBe("dark");
    expect(normalizeThemeStored(DSA_THEME_LEGACY_FULL_NAME.dark)).toBe("dark");
    expect(normalizeThemeStored(DSA_THEME_WIRE.lavender)).toBe("lavender");
    expect(normalizeThemeStored(DSA_THEME_LEGACY_FULL_NAME.lavender)).toBe("lavender");
  });
});

describe("themeStoredNeedsRewrite", () => {
  it("rewrites retired System tokens and pre-wire full names", () => {
    expect(themeStoredNeedsRewrite(null)).toBe(false);
    expect(themeStoredNeedsRewrite("")).toBe(false);
    expect(themeStoredNeedsRewrite(DSA_THEME_WIRE.light)).toBe(false);
    expect(themeStoredNeedsRewrite(DSA_THEME_LEGACY_SYSTEM_WIRE)).toBe(true);
    expect(themeStoredNeedsRewrite(DSA_THEME_LEGACY_SYSTEM_NAME)).toBe(true);
    expect(themeStoredNeedsRewrite(DSA_THEME_LEGACY_FULL_NAME.dark)).toBe(true);
  });
});

describe("migrateStoredTheme", () => {
  it("persists Light for retired System users and leaves current wire tokens alone", () => {
    expect(migrateStoredTheme(DSA_THEME_LEGACY_SYSTEM_WIRE)).toEqual({
      preference: "light",
      persistWire: DSA_THEME_WIRE.light,
    });
    expect(migrateStoredTheme(DSA_THEME_LEGACY_SYSTEM_NAME)).toEqual({
      preference: "light",
      persistWire: DSA_THEME_WIRE.light,
    });
    expect(migrateStoredTheme("SYSTEM")).toEqual({
      preference: "light",
      persistWire: DSA_THEME_WIRE.light,
    });
    expect(migrateStoredTheme(null)).toEqual({
      preference: "light",
      persistWire: null,
    });
    expect(migrateStoredTheme(DSA_THEME_WIRE.dark)).toEqual({
      preference: "dark",
      persistWire: null,
    });
    expect(migrateStoredTheme(DSA_THEME_WIRE.lavender)).toEqual({
      preference: "lavender",
      persistWire: null,
    });
  });
});

describe("themeToWire", () => {
  it("maps each selectable theme to its compact token", () => {
    expect(themeToWire("light")).toBe("l");
    expect(themeToWire("dark")).toBe("d");
    expect(themeToWire("lavender")).toBe("v");
  });
});
