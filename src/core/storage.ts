import type { ScoreEntry, ScoreMode } from "./scoring";

const SCORES_KEY = "p-xing.scores.v1";
const SCORE_MODES = new Set<ScoreMode>(["classic", "assisted"]);

function isScoreEntry(value: unknown): value is ScoreEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry["puzzleId"] === "string" &&
    SCORE_MODES.has(entry["mode"] as ScoreMode) &&
    typeof entry["initials"] === "string" &&
    /^[A-Z0-9]{3}$/.test(entry["initials"]) &&
    typeof entry["elapsedMs"] === "number" &&
    Number.isFinite(entry["elapsedMs"]) &&
    entry["elapsedMs"] >= 0 &&
    typeof entry["mistakes"] === "number" &&
    Number.isInteger(entry["mistakes"]) &&
    entry["mistakes"] >= 0 &&
    typeof entry["hints"] === "number" &&
    Number.isInteger(entry["hints"]) &&
    entry["hints"] >= 0 &&
    typeof entry["score"] === "number" &&
    Number.isFinite(entry["score"]) &&
    entry["score"] >= 0 &&
    typeof entry["completedAt"] === "string" &&
    !Number.isNaN(Date.parse(entry["completedAt"]))
  );
}

export function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isScoreEntry);
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
