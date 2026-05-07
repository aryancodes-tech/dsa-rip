/**
 * Compact localStorage payloads for tracker state (`dsa.done`, `dsa.rev`, `dsa.notes`).
 *
 * Problems are keyed in-app by long string IDs; persisted form uses stable sheet coordinates
 * `[stepNo, subStepNo, idxInSubStep]` (~3 integers per row vs long strings with titles encoded in id).
 */
import { SHEET } from "@/data/sheet";

/** Wrapper version on wire: `[ SCHEMA_VERSION, payload ]`. */
export const DSA_LS_SCHEMA_VERSION = 2;

/**
 * Legacy done/revision keys stored a flat JSON array of full problem-id strings
 * (long). Compact format is `[DSA_LS_SCHEMA_VERSION, Triple[]]`.
 */
export function problemSetStoredAsLegacyFlatIds(raw: string | null): boolean {
  if (raw === null || raw.length === 0) return false;
  try {
    const a: unknown = JSON.parse(raw);
    if (!Array.isArray(a) || a.length === 0) return false;
    if (a.length >= 2 && a[0] === DSA_LS_SCHEMA_VERSION && Array.isArray(a[1])) return false;
    return typeof a[0] === "string";
  } catch {
    return false;
  }
}

/** Legacy notes were a plain `{ [problemId]: text }` object. */
export function notesStoredAsLegacyObject(raw: string | null): boolean {
  if (raw === null || raw.length === 0) return false;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed);
  } catch {
    return false;
  }
}

const PROBLEM_ID_PREFIX = /^s(\d+)-ss(\d+)-(\d+)-/;

type Triple = readonly [step: number, subStep: number, idx: number];

let tripleKeyToLatestId: Map<string, string> | null = null;

function canonKey(step: number, sub: number, idx: number): string {
  return `${step}\x1f${sub}\x1f${idx}`;
}

/**
 * Builds a map from (step, sub, idx) → current {@link SHEET} problem id when the sheet is loaded.
 */
function getTripleKeyToLatestId(): Map<string, string> {
  if (tripleKeyToLatestId !== null) return tripleKeyToLatestId;
  const m = new Map<string, string>();
  for (const st of SHEET) {
    for (const ss of st.subSteps) {
      ss.problems.forEach((p, i) => {
        m.set(canonKey(st.stepNo, ss.subStepNo, i), p.id);
      });
    }
  }
  tripleKeyToLatestId = m;
  return tripleKeyToLatestId;
}

/**
 * Parses the numeric prefix baked into sheet problem ids (step / sub-step / row index within sub-step).
 */
export function tripleFromProblemId(problemId: string): Triple | null {
  if (problemId.length === 0) return null;
  const m = problemId.match(PROBLEM_ID_PREFIX);
  if (m === null) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function tripleLt(a: Triple, b: Triple): number {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  return a[2] - b[2];
}

function coerceTriple(raw: unknown): Triple | null {
  if (!Array.isArray(raw) || raw.length !== 3) return null;
  const a = Number(raw[0]);
  const b = Number(raw[1]);
  const c = Number(raw[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) return null;
  if (!Number.isInteger(a) || !Number.isInteger(b) || !Number.isInteger(c)) return null;
  if (a < 0 || b < 0 || c < 0) return null;
  return [a, b, c];
}

function resolveTripleToLatestId(ref: Triple): string | null {
  const resolved = getTripleKeyToLatestId().get(canonKey(ref[0], ref[1], ref[2]));
  return resolved !== undefined ? resolved : null;
}

/**
 * Encodes done/revision ids for localStorage (`[ VERSION, Triple[] ]`).
 */
export function encodeProblemIdSet(ids: Iterable<string>): string {
  const triplesSet = new Map<string, Triple>();
  for (const id of ids) {
    if (id.length === 0) continue;
    const t = tripleFromProblemId(id);
    if (t === null) continue;
    if (resolveTripleToLatestId(t) === null) continue;
    triplesSet.set(canonKey(t[0], t[1], t[2]), t);
  }
  const triples = [...triplesSet.values()].sort(tripleLt);
  return JSON.stringify([DSA_LS_SCHEMA_VERSION, triples]);
}

/** Loads a done/revision set from localStorage JSON (handles legacy string[]). */
export function decodeProblemIdSet(raw: string | null): Set<string> {
  const out = new Set<string>();
  if (raw === null || raw.length === 0) return out;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return out;

    if (
      parsed.length === 2 &&
      parsed[0] === DSA_LS_SCHEMA_VERSION &&
      Array.isArray(parsed[1])
    ) {
      for (const row of parsed[1]) {
        const t = coerceTriple(row);
        if (t === null) continue;
        const id = resolveTripleToLatestId(t);
        if (id !== null) out.add(id);
      }
      return out;
    }

    for (const el of parsed) {
      if (typeof el !== "string" || el.length === 0) continue;
      const t = tripleFromProblemId(el);
      if (t !== null) {
        const id = resolveTripleToLatestId(t);
        if (id !== null) out.add(id);
      } else {
        out.add(el);
      }
    }
    return out;
  } catch {
    return out;
  }
}

type NotesWire = Record<string, string>;
type CompactNoteRow = [Triple, string];

/**
 * Encodes per-problem notes as `[ VERSION, CompactNoteRow[] ]` using triple keys instead of full problem ids.
 */
export function encodeNotesMap(state: NotesWire): string {
  const compact: CompactNoteRow[] = [];
  for (const problemId of Object.keys(state)) {
    if (problemId.length === 0) continue;
    const note = state[problemId];
    if (typeof note !== "string" || note.length === 0) continue;
    const t = tripleFromProblemId(problemId);
    if (t === null) continue;
    compact.push([[t[0], t[1], t[2]], note]);
  }
  compact.sort(([a], [b]) => tripleLt(a as Triple, b as Triple));
  return JSON.stringify([DSA_LS_SCHEMA_VERSION, compact]);
}

/**
 * Parses notes blob (legacy `{ [problemId]: string }` vs compact tuples).
 */
export function decodeNotesMap(raw: string | null): NotesWire {
  const out: NotesWire = {};
  if (raw === null || raw.length === 0) return out;
  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      Array.isArray(parsed) &&
      parsed.length === 2 &&
      parsed[0] === DSA_LS_SCHEMA_VERSION &&
      Array.isArray(parsed[1])
    ) {
      for (const row of parsed[1]) {
        if (!Array.isArray(row) || row.length !== 2) continue;
        const t = coerceTriple(row[0]);
        const text = typeof row[1] === "string" ? row[1] : "";
        if (t === null || text.length === 0) continue;
        const id = resolveTripleToLatestId(t);
        if (id !== null) out[id] = text;
      }
      return out;
    }

    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      const obj = parsed as NotesWire;
      for (const k of Object.keys(obj)) {
        if (k.length === 0) continue;
        const v = obj[k];
        if (typeof v === "string" && v.length > 0) out[k] = v;
      }
    }
    return out;
  } catch {
    return out;
  }
}
