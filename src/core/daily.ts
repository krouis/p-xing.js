import type { Puzzle } from "./puzzle";

export function getDailyIndex(dateStr: string, count: number): number {
  if (count === 0) return 0;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash) % count;
}

export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDailyPuzzle(puzzles: Puzzle[]): Puzzle | null {
  if (puzzles.length === 0) return null;
  const idx = getDailyIndex(getTodayString(), puzzles.length);
  return puzzles[idx] ?? null;
}
