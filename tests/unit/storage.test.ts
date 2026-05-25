import { describe, it, expect, beforeEach } from "vitest";
import { loadScores, saveScore, getTopScores } from "../../src/core/storage";
import type { ScoreEntry } from "../../src/core/scoring";

const SAMPLE_SCORE: ScoreEntry = {
  puzzleId: "test-001",
  mode: "classic",
  initials: "ABC",
  elapsedMs: 60000,
  mistakes: 2,
  hints: 0,
  score: 90000,
  completedAt: "2026-05-25T00:00:00Z",
};

describe("loadScores", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array by default", () => {
    expect(loadScores()).toEqual([]);
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("p-xing.scores.v1", "not-json{{{{");
    expect(loadScores()).toEqual([]);
  });

  it("handles non-array JSON gracefully", () => {
    localStorage.setItem("p-xing.scores.v1", JSON.stringify({ bad: true }));
    expect(loadScores()).toEqual([]);
  });

  it("filters malformed score entries", () => {
    localStorage.setItem(
      "p-xing.scores.v1",
      JSON.stringify([
        SAMPLE_SCORE,
        { ...SAMPLE_SCORE, initials: "<x>" },
        { ...SAMPLE_SCORE, score: Number.NaN },
        { ...SAMPLE_SCORE, completedAt: "not-a-date" },
      ]),
    );
    expect(loadScores()).toEqual([SAMPLE_SCORE]);
  });
});

describe("saveScore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves a score and makes it loadable", () => {
    saveScore(SAMPLE_SCORE);
    expect(loadScores()).toHaveLength(1);
  });

  it("accumulates multiple scores", () => {
    saveScore(SAMPLE_SCORE);
    saveScore({ ...SAMPLE_SCORE, score: 80000 });
    expect(loadScores()).toHaveLength(2);
  });
});

describe("getTopScores", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array when no scores exist", () => {
    expect(getTopScores("test-001", "classic", 10)).toEqual([]);
  });

  it("filters by puzzleId and mode", () => {
    saveScore(SAMPLE_SCORE);
    saveScore({ ...SAMPLE_SCORE, puzzleId: "other-001" });
    saveScore({ ...SAMPLE_SCORE, mode: "assisted" });
    const top = getTopScores("test-001", "classic", 10);
    expect(top).toHaveLength(1);
  });

  it("respects the limit", () => {
    for (let i = 0; i < 5; i++) {
      saveScore({ ...SAMPLE_SCORE, score: i * 1000 });
    }
    expect(getTopScores("test-001", "classic", 3)).toHaveLength(3);
  });
});
