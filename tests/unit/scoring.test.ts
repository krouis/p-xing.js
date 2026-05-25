import { describe, it, expect } from "vitest";
import { calculateScore } from "../../src/core/scoring";

describe("calculateScore", () => {
  it("returns 100000 for a perfect solve (0ms, 0 mistakes, 0 hints)", () => {
    expect(calculateScore(0, 0, 0)).toBe(100000);
  });

  it("deducts 1 point per 10ms of elapsed time", () => {
    expect(calculateScore(10000, 0, 0)).toBe(99000);
    expect(calculateScore(100000, 0, 0)).toBe(90000);
  });

  it("floors the time penalty (no fractional deduction)", () => {
    expect(calculateScore(9, 0, 0)).toBe(100000); // 9/10 = 0 → no deduction
    expect(calculateScore(15, 0, 0)).toBe(99999); // 15/10 = 1 → 1 point
  });

  it("deducts 5000 per mistake", () => {
    expect(calculateScore(0, 1, 0)).toBe(95000);
    expect(calculateScore(0, 3, 0)).toBe(85000);
  });

  it("deducts 10000 per hint", () => {
    expect(calculateScore(0, 0, 1)).toBe(90000);
    expect(calculateScore(0, 0, 2)).toBe(80000);
  });

  it("combines all deductions correctly", () => {
    // 100000 - 1000 (10s) - 5000 (1 mistake) - 10000 (1 hint) = 84000
    expect(calculateScore(10000, 1, 1)).toBe(84000);
  });

  it("never returns below 0", () => {
    expect(calculateScore(Number.MAX_SAFE_INTEGER, 0, 0)).toBe(0);
    expect(calculateScore(0, 100, 100)).toBe(0);
  });
});
