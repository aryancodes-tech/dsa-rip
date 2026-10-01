import { describe, expect, it } from "vitest";
import {
  composeTufLearningUrl,
  composeTufPracticeUrl,
  TUF_LEARNING_DSA_PATH,
  TUF_ORIGIN,
  TUF_PRACTICE_DSA_PATH,
} from "@/constants/tuf";

describe("composeTufPracticeUrl", () => {
  it("returns empty for an empty slug", () => {
    expect(composeTufPracticeUrl("")).toBe("");
  });

  it("joins origin, practice path, and encoded slug", () => {
    expect(composeTufPracticeUrl("infix-to-postfix-conversion")).toBe(
      `${TUF_ORIGIN}${TUF_PRACTICE_DSA_PATH}/infix-to-postfix-conversion`,
    );
  });
});

describe("composeTufLearningUrl", () => {
  it("joins origin, learning path, and encoded slug", () => {
    expect(composeTufLearningUrl("")).toBe("");
    expect(composeTufLearningUrl("learn-cpp")).toBe(
      `${TUF_ORIGIN}${TUF_LEARNING_DSA_PATH}/learn-cpp`,
    );
  });
});
