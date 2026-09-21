import { describe, expect, it } from "vitest";
import {
  DSA_SPLASH_DARK_LOGO_MAT_BG,
  DSA_SPLASH_DURATION_MS,
  DSA_SPLASH_REDUCED_MOTION_MS,
  splashHoldMs,
} from "@/constants/splash";

describe("splashHoldMs", () => {
  it("uses the full hold by default and a short hold when motion is reduced", () => {
    expect(splashHoldMs(false)).toBe(DSA_SPLASH_DURATION_MS);
    expect(splashHoldMs(true)).toBe(DSA_SPLASH_REDUCED_MOTION_MS);
    expect(DSA_SPLASH_REDUCED_MOTION_MS).toBeLessThan(DSA_SPLASH_DURATION_MS);
  });
});

describe("DSA_SPLASH_DARK_LOGO_MAT_BG", () => {
  it("is the cream plate used behind the lockup in dark mode", () => {
    expect(DSA_SPLASH_DARK_LOGO_MAT_BG).toBe("#f7f6f2");
  });
});
