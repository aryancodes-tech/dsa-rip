import { describe, expect, it } from "vitest";
import { DSA_TOUR_DONE_VALUE } from "@/constants/tour";
import {
  DSA_WHATS_NEW_CTA,
  DSA_WHATS_NEW_ITEMS,
  DSA_WHATS_NEW_RELEASE_DATE,
  DSA_WHATS_NEW_TITLE,
  DSA_WHATS_NEW_VERSION,
  formatWhatsNewReleaseHeading,
  hasSeenWhatsNew,
  shouldOfferWhatsNew,
  splitWhatsNewLine,
} from "@/constants/whats-new";

describe("DSA_WHATS_NEW_VERSION", () => {
  it("is a non-empty changelog id", () => {
    expect(DSA_WHATS_NEW_VERSION.length).toBeGreaterThan(0);
  });
});

describe("DSA_WHATS_NEW_ITEMS", () => {
  it("has short scan lines", () => {
    expect(DSA_WHATS_NEW_ITEMS.length).toBeGreaterThan(0);
    for (const item of DSA_WHATS_NEW_ITEMS) {
      expect(item.line.length).toBeGreaterThan(0);
    }
  });

  it("leads with TUF articles", () => {
    const first = DSA_WHATS_NEW_ITEMS[0]?.line ?? "";
    expect(first.length).toBeGreaterThan(0);
    expect(first.includes("TUF")).toBe(true);
    expect(first.toLowerCase().includes("article")).toBe(true);
  });
});

describe("changelog chrome", () => {
  it("names the dialog and the dismiss control", () => {
    expect(DSA_WHATS_NEW_TITLE).toBe("Release notes");
    expect(DSA_WHATS_NEW_CTA).toBe("Continue");
  });
});

describe("formatWhatsNewReleaseHeading", () => {
  it("shows the date only", () => {
    expect(formatWhatsNewReleaseHeading()).toBe(DSA_WHATS_NEW_RELEASE_DATE);
  });

  it("returns empty when the date is empty", () => {
    expect(formatWhatsNewReleaseHeading("")).toBe("");
  });
});

describe("splitWhatsNewLine", () => {
  it("returns empty for an empty line", () => {
    expect(splitWhatsNewLine("")).toEqual([]);
  });

  it("keeps plain text as a single part", () => {
    expect(splitWhatsNewLine("Softer text highlight")).toEqual([
      { code: false, text: "Softer text highlight" },
    ]);
  });

  it("marks backtick runs as code", () => {
    expect(splitWhatsNewLine("`TUF` column next to `LeetCode`")).toEqual([
      { code: true, text: "TUF" },
      { code: false, text: " column next to " },
      { code: true, text: "LeetCode" },
    ]);
  });
});

describe("hasSeenWhatsNew", () => {
  it("returns false when nothing is stored", () => {
    expect(hasSeenWhatsNew(null)).toBe(false);
    expect(hasSeenWhatsNew("")).toBe(false);
  });

  it("returns true only for the current version", () => {
    expect(hasSeenWhatsNew(DSA_WHATS_NEW_VERSION)).toBe(true);
    expect(hasSeenWhatsNew("older")).toBe(false);
  });

  it("treats an empty version as already seen", () => {
    expect(hasSeenWhatsNew(null, "")).toBe(true);
  });
});

describe("shouldOfferWhatsNew", () => {
  it("is false when the tour is not finished", () => {
    expect(shouldOfferWhatsNew(null, null)).toBe(false);
    expect(shouldOfferWhatsNew(null, "")).toBe(false);
  });

  it("is true only for tour graduates who have not dismissed this note", () => {
    expect(shouldOfferWhatsNew(null, DSA_TOUR_DONE_VALUE)).toBe(true);
    expect(shouldOfferWhatsNew(DSA_WHATS_NEW_VERSION, DSA_TOUR_DONE_VALUE)).toBe(false);
  });
});
