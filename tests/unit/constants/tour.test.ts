import { describe, expect, it } from "vitest";
import { DSA_TOUR_DONE_VALUE, isTourCompleted } from "@/constants/tour";

describe("isTourCompleted", () => {
  it("is false when the flag is missing or empty", () => {
    expect(isTourCompleted(null)).toBe(false);
    expect(isTourCompleted("")).toBe(false);
  });

  it("is true only for the finished-tour value", () => {
    expect(isTourCompleted(DSA_TOUR_DONE_VALUE)).toBe(true);
    expect(isTourCompleted("0")).toBe(false);
  });
});
