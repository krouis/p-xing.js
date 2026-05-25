export type ScoreMode = "classic" | "assisted";

export interface ScoreEntry {
  puzzleId: string;
  mode: ScoreMode;
  initials: string;
  elapsedMs: number;
  mistakes: number;
  hints: number;
  score: number;
  completedAt: string;
}

export function calculateScore(
  elapsedMs: number,
  mistakes: number,
  hints: number,
): number {
  return Math.max(
    0,
    100000 - Math.floor(elapsedMs / 10) - mistakes * 5000 - hints * 10000,
  );
}
