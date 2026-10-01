import { describe, expect, it } from "vitest";
import {
  computeProblemTitleColSpanSm,
  DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY,
  optionalColumnMaskToVisibility,
  visibilityToOptionalColumnMask,
} from "@/constants/sheet-columns";

describe("optional sheet column mask", () => {
  it("round-trips default visibility", () => {
    const mask = visibilityToOptionalColumnMask(DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY);
    expect(optionalColumnMaskToVisibility(mask)).toEqual(DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY);
  });

  it("falls back to defaults for non-finite masks", () => {
    expect(optionalColumnMaskToVisibility(Number.NaN)).toEqual(
      DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY,
    );
  });

  it("computes title col span from remaining 12-col grid", () => {
    const allOn = {
      youtube: true,
      article: true,
      note: true,
      revision: true,
      difficulty: true,
    };
    expect(computeProblemTitleColSpanSm(allOn)).toBe(2);
    expect(computeProblemTitleColSpanSm(DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY)).toBe(2);
    expect(
      computeProblemTitleColSpanSm({
        ...DEFAULT_OPTIONAL_SHEET_COLUMN_VISIBILITY,
        article: false,
      }),
    ).toBe(3);
  });
});
