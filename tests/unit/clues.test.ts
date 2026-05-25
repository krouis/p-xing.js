import { describe, it, expect } from "vitest";
import {
  getLineClues,
  getRowClues,
  getColumnClues,
} from "../../src/core/clues";
import type { Puzzle } from "../../src/core/puzzle";

// Tiny Rocket: 5×5 puzzle with known clues
const ROCKET: Puzzle = {
  id: "rocket",
  title: "Tiny Rocket",
  width: 5,
  height: 5,
  difficulty: "starter",
  pixels: [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1],
  ],
};

describe("getLineClues", () => {
  it("returns [0] for an all-empty line", () => {
    expect(getLineClues([0, 0, 0])).toEqual([0]);
  });

  it("returns [0] for an empty array", () => {
    expect(getLineClues([])).toEqual([0]);
  });

  it("counts a single contiguous group", () => {
    expect(getLineClues([0, 1, 1, 0])).toEqual([2]);
  });

  it("counts two separated groups", () => {
    expect(getLineClues([1, 0, 1])).toEqual([1, 1]);
  });

  it("handles filled pixels at the start", () => {
    expect(getLineClues([1, 1, 0])).toEqual([2]);
  });

  it("handles filled pixels at the end", () => {
    expect(getLineClues([0, 1, 1])).toEqual([2]);
  });

  it("handles spec example [0,1,1,0,1] → [2,1]", () => {
    expect(getLineClues([0, 1, 1, 0, 1])).toEqual([2, 1]);
  });

  it("handles all-filled line", () => {
    expect(getLineClues([1, 1, 1])).toEqual([3]);
  });

  it("handles single filled pixel", () => {
    expect(getLineClues([0, 1, 0])).toEqual([1]);
  });
});

describe("getRowClues", () => {
  it("returns one clue array per row", () => {
    expect(getRowClues(ROCKET)).toHaveLength(5);
  });

  it("computes correct row clues for the rocket puzzle", () => {
    expect(getRowClues(ROCKET)).toEqual([[1], [3], [1], [3], [1, 1, 1]]);
  });
});

describe("getColumnClues", () => {
  it("returns one clue array per column", () => {
    expect(getColumnClues(ROCKET)).toHaveLength(5);
  });

  it("computes correct column clues for the rocket puzzle", () => {
    expect(getColumnClues(ROCKET)).toEqual([[1], [1, 1], [5], [1, 1], [1]]);
  });
});
