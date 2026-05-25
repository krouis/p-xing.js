import { describe, it, expect } from "vitest";
import {
  getDailyIndex,
  getTodayString,
  getDailyPuzzle,
} from "../../src/core/daily";
import type { Puzzle } from "../../src/core/puzzle";

const STUB_PUZZLE: Puzzle = {
  id: "test-001",
  title: "Test",
  width: 1,
  height: 1,
  difficulty: "starter",
  pixels: [[1]],
};

describe("getDailyIndex", () => {
  it("returns 0 for an empty pool", () => {
    expect(getDailyIndex("2026-05-25", 0)).toBe(0);
  });

  it("returns a value in [0, count)", () => {
    const idx = getDailyIndex("2026-05-25", 10);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(10);
  });

  it("is deterministic for the same date", () => {
    expect(getDailyIndex("2026-05-25", 100)).toBe(
      getDailyIndex("2026-05-25", 100),
    );
  });

  it("produces different indices for different dates across a 10-day window", () => {
    // It's statistically impossible for 10 consecutive days to all hash identically
    const indices = new Set<number>();
    for (let day = 1; day <= 10; day++) {
      indices.add(
        getDailyIndex(`2026-05-${String(day).padStart(2, "0")}`, 100),
      );
    }
    expect(indices.size).toBeGreaterThan(1);
  });

  it("handles an empty date string", () => {
    const idx = getDailyIndex("", 10);
    expect(idx).toBe(0); // hash starts at 0, returns 0 % 10 = 0
  });
});

describe("getTodayString", () => {
  it("returns a string matching YYYY-MM-DD", () => {
    expect(getTodayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns the current UTC date", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(getTodayString()).toBe(today);
  });
});

describe("getDailyPuzzle", () => {
  it("returns null for an empty list", () => {
    expect(getDailyPuzzle([])).toBeNull();
  });

  it("returns the only puzzle when the list has one element", () => {
    expect(getDailyPuzzle([STUB_PUZZLE])).toBe(STUB_PUZZLE);
  });

  it("returns a puzzle that exists in the list", () => {
    const puzzles = [STUB_PUZZLE, { ...STUB_PUZZLE, id: "test-002" }];
    const result = getDailyPuzzle(puzzles);
    expect(puzzles).toContain(result);
  });
});
