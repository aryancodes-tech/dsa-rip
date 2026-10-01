import { describe, expect, it } from "vitest";
import {
  SHEET_RESET_SOLVED_CONFIRM_ACTION,
  SHEET_RESET_SOLVED_CONFIRM_BODY,
  SHEET_RESET_SOLVED_TOOLTIP,
  formatSheetProgressPercent,
  formatSheetSolvedCount,
  sheetProgressSummaryAriaLabel,
  sheetResetStepSolvedAriaLabel,
  sheetResetSubStepSolvedAriaLabel,
} from "@/constants/sheet-progress";

describe("sheet reset copy", () => {
  it("uses a short hover tooltip and a status-only confirmation body", () => {
    expect(SHEET_RESET_SOLVED_TOOLTIP).toBe("Reset Progress");
    expect(SHEET_RESET_SOLVED_CONFIRM_BODY).toContain("status");
    expect(SHEET_RESET_SOLVED_CONFIRM_BODY).toContain("Notes and revision marks will stay as they are");
    expect(SHEET_RESET_SOLVED_CONFIRM_ACTION).toBe("Reset");
  });
});

describe("sheetResetStepSolvedAriaLabel", () => {
  it("returns a fallback when the title is empty", () => {
    expect(sheetResetStepSolvedAriaLabel(1, "")).toBe("Reset solved status for step 1");
  });

  it("includes the step title", () => {
    expect(sheetResetStepSolvedAriaLabel(1, "Learn the basics")).toBe(
      "Reset solved status for step 1: Learn the basics",
    );
  });
});

describe("toolbar progress copy", () => {
  it("formats the solved count and percent with spaces", () => {
    expect(formatSheetSolvedCount(0, 557)).toBe("0 of 557 solved");
    expect(formatSheetProgressPercent(0)).toBe("0%");
    expect(formatSheetProgressPercent(12.6)).toBe("13%");
  });

  it("builds an accessible overall summary", () => {
    expect(sheetProgressSummaryAriaLabel(3, 557, 0.5)).toBe(
      "3 of 557 solved, 1 percent complete",
    );
  });
});

describe("sheetResetSubStepSolvedAriaLabel", () => {
  it("returns a fallback when the title is empty", () => {
    expect(sheetResetSubStepSolvedAriaLabel(1, 2, "")).toBe(
      "Reset solved status for subsection 1.2",
    );
  });

  it("includes the subsection title", () => {
    expect(sheetResetSubStepSolvedAriaLabel(1, 1, "Things to Know")).toBe(
      "Reset solved status for subsection 1.1: Things to Know",
    );
  });
});
