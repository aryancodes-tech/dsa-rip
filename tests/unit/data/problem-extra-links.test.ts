import { describe, expect, it } from "vitest";
import {
  composeCoordKey,
  getProblemExtraLinks,
  normalizeCoordTitle,
  normalizeTitleKey,
  parseExtraLinksFile,
} from "@/data/problem-extra-links";

describe("problem extra links", () => {
  it("looks up YouTube by sheet coordinate", () => {
    const links = getProblemExtraLinks(1, 1, "User Input / Output");
    expect(links.youtubeLink).toMatch(/^https:\/\/youtu\.be\//);
  });

  it("looks up article URLs by title", () => {
    const links = getProblemExtraLinks(1, 4, "Count Digits");
    expect(links.articleLink).toMatch(/^https:\/\/takeuforward\.org\//);
  });

  it("normalizes coord and title keys", () => {
    expect(normalizeCoordTitle("  User   Input / Output ")).toBe("user input / output");
    expect(normalizeTitleKey("Count Digits!")).toBe("count digits");
    expect(composeCoordKey(1, 1, "user input / output")).toBe("1|1|user input / output");
  });

  it("rejects extra-links payloads that drift from the expected shape", () => {
    expect(() => parseExtraLinksFile({ byCoord: {}, extra: true })).toThrow();
    expect(parseExtraLinksFile({ byCoord: {}, byTitle: {} })).toEqual({ byCoord: {}, byTitle: {} });
  });
});
