import { describe, it, expect } from "vitest";
import {
  validateInitials,
  normalizeInitials,
  validatePuzzle,
  getValidPuzzles,
} from "../../src/core/validation";
import type { Puzzle } from "../../src/core/puzzle";

const VALID_PUZZLE: Puzzle = {
  id: "valid",
  title: "Valid",
  width: 2,
  height: 2,
  difficulty: "starter",
  pixels: [
    [1, 0],
    [0, 1],
  ],
};

describe("validateInitials", () => {
  it("accepts 3 uppercase letters", () => {
    expect(validateInitials("ABC")).toBe(true);
  });

  it("accepts 3 digits", () => {
    expect(validateInitials("123")).toBe(true);
  });

  it("accepts mixed alphanumeric", () => {
    expect(validateInitials("A1B")).toBe(true);
  });

  it("accepts lowercase input by normalizing", () => {
    expect(validateInitials("abc")).toBe(true);
  });

  it("rejects fewer than 3 characters", () => {
    expect(validateInitials("AB")).toBe(false);
  });

  it("rejects more than 3 characters", () => {
    expect(validateInitials("ABCD")).toBe(false);
  });

  it("rejects special characters", () => {
    expect(validateInitials("A!C")).toBe(false);
  });

  it("rejects spaces", () => {
    expect(validateInitials("A C")).toBe(false);
  });
});

describe("normalizeInitials", () => {
  it("converts lowercase to uppercase", () => {
    expect(normalizeInitials("abc")).toBe("ABC");
  });

  it("leaves uppercase unchanged", () => {
    expect(normalizeInitials("XYZ")).toBe("XYZ");
  });
});

describe("validatePuzzle", () => {
  it("accepts a well-formed puzzle", () => {
    expect(validatePuzzle(VALID_PUZZLE)).toEqual({ valid: true, errors: [] });
  });

  it("rejects empty ids and titles", () => {
    const result = validatePuzzle({ ...VALID_PUZZLE, id: "", title: " " });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Puzzle id is required.");
    expect(result.errors).toContain("Puzzle title is required.");
  });

  it("rejects non-positive dimensions", () => {
    const result = validatePuzzle({ ...VALID_PUZZLE, width: 0, height: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Puzzle width must be a positive integer.");
    expect(result.errors).toContain(
      "Puzzle height must be a positive integer.",
    );
  });

  it("rejects mismatched row counts and row widths", () => {
    const result = validatePuzzle({
      ...VALID_PUZZLE,
      width: 3,
      height: 3,
      pixels: [[1, 0]],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Puzzle row count must match height.");
    expect(result.errors).toContain("Puzzle row 1 must match width.");
  });

  it("rejects invalid pixel values", () => {
    const result = validatePuzzle({
      ...VALID_PUZZLE,
      pixels: [
        [1, 2],
        [0, 1],
      ],
    } as Puzzle);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Puzzle pixel 2,1 must be 0 or 1.");
  });

  it("rejects all-empty puzzles", () => {
    const result = validatePuzzle({
      ...VALID_PUZZLE,
      pixels: [
        [0, 0],
        [0, 0],
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Puzzle must include at least one filled pixel.",
    );
  });
});

describe("getValidPuzzles", () => {
  it("returns only valid puzzles", () => {
    const invalid: Puzzle = {
      ...VALID_PUZZLE,
      id: "invalid",
      pixels: [
        [0, 0],
        [0, 0],
      ],
    };
    expect(getValidPuzzles([VALID_PUZZLE, invalid])).toEqual([VALID_PUZZLE]);
  });
});
