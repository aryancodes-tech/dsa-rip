import { describe, expect, it } from "vitest";
import {
  DSA_LS_SCHEMA_VERSION,
  decodeNotesMap,
  decodeProblemIdSet,
  encodeNotesMap,
  encodeProblemIdSet,
  notesStoredAsLegacyObject,
  problemSetStoredAsLegacyFlatIds,
  tripleFromProblemId,
} from "@/lib/dsa-local-storage-schema";
import { ALL_PROBLEMS } from "@/data/sheet";

const sample = ALL_PROBLEMS[0];

describe("dsa-local-storage-schema", () => {
  it("round-trips compact problem id sets", () => {
    const encoded = encodeProblemIdSet([sample.id]);
    const parsed: unknown = JSON.parse(encoded);
    expect(Array.isArray(parsed) && parsed[0] === DSA_LS_SCHEMA_VERSION).toBe(true);
    expect(decodeProblemIdSet(encoded)).toEqual(new Set([sample.id]));
  });

  it("decodes legacy flat problem-id arrays", () => {
    const legacy = JSON.stringify([sample.id]);
    expect(problemSetStoredAsLegacyFlatIds(legacy)).toBe(true);
    expect(decodeProblemIdSet(legacy)).toEqual(new Set([sample.id]));
  });

  it("round-trips compact notes and reads legacy objects", () => {
    const compact = encodeNotesMap({ [sample.id]: "two pointers" });
    expect(decodeNotesMap(compact)).toEqual({ [sample.id]: "two pointers" });

    const legacy = JSON.stringify({ [sample.id]: "kadane" });
    expect(notesStoredAsLegacyObject(legacy)).toBe(true);
    expect(decodeNotesMap(legacy)).toEqual({ [sample.id]: "kadane" });
  });

  it("parses step/sub-step/index from problem ids", () => {
    const triple = tripleFromProblemId(sample.id);
    expect(triple).toEqual([sample.stepNo, sample.subStepNo, 0]);
  });
});
