import { describe, expect, it } from "vitest";
import { omitIdsFromSet } from "@/lib/tracker-store";

describe("omitIdsFromSet", () => {
  it("unchecks only the given ids and ignores empty strings", () => {
    const done = new Set(["a", "b", "c"]);
    expect([...omitIdsFromSet(done, ["b", "", "missing"])].sort()).toEqual(["a", "c"]);
    expect([...done].sort()).toEqual(["a", "b", "c"]);
  });

  it("leaves the set unchanged when none of the ids were solved", () => {
    const done = new Set(["a"]);
    expect(omitIdsFromSet(done, ["z"]).size).toBe(1);
  });
});
