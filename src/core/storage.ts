import type { ScoreEntry, ScoreMode } from "./scoring";

const SCORES_KEY = "p-xing.scores.v1";

export function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ScoreEntry[];
  } catch {
    return [];
  }
}

export function saveScore(score: ScoreEntry): void {
  try {
    const scores = loadScores();
    scores.push(score);
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  } catch {
    // localStorage unavailable — game still playable
  }
}

export function getTopScores(
  puzzleId: string,
  mode: ScoreMode,
  limit: number,
): ScoreEntry[] {
  return loadScores()
    .filter((s) => s.puzzleId === puzzleId && s.mode === mode)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
