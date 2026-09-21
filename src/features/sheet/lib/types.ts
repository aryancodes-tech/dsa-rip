import type { Difficulty } from "@/data/sheet";

/** Aggregated solved counts shown in the dashboard card. */
export type SheetStats = {
  total: number;
  solved: number;
  pct: number;
  revCount: number;
  easy: number;
  medium: number;
  hard: number;
};

/** One Easy / Medium / Hard progress tile. */
export type DifficultyBreakdownRow = {
  key: Difficulty;
  solved: number;
  pool: number;
};
