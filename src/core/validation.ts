import type { Puzzle } from "./puzzle";

const INITIALS_RE = /^[A-Z0-9]{3}$/;

export function validateInitials(input: string): boolean {
  return INITIALS_RE.test(input.toUpperCase());
}

export function normalizeInitials(input: string): string {
  return input.toUpperCase();
}

export interface PuzzleValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePuzzle(puzzle: Puzzle): PuzzleValidationResult {
  const errors: string[] = [];

  if (puzzle.id.trim().length === 0) errors.push("Puzzle id is required.");
  if (puzzle.title.trim().length === 0)
    errors.push("Puzzle title is required.");
  if (!Number.isInteger(puzzle.width) || puzzle.width <= 0) {
    errors.push("Puzzle width must be a positive integer.");
  }
  if (!Number.isInteger(puzzle.height) || puzzle.height <= 0) {
    errors.push("Puzzle height must be a positive integer.");
  }
  if (puzzle.pixels.length !== puzzle.height) {
    errors.push("Puzzle row count must match height.");
  }

  let filledCount = 0;
  puzzle.pixels.forEach((row, y) => {
    if (row.length !== puzzle.width) {
      errors.push(`Puzzle row ${y + 1} must match width.`);
    }
    row.forEach((pixel, x) => {
      if (pixel !== 0 && pixel !== 1) {
        errors.push(`Puzzle pixel ${x + 1},${y + 1} must be 0 or 1.`);
      }
      if (pixel === 1) filledCount++;
    });
  });

  if (filledCount === 0) {
    errors.push("Puzzle must include at least one filled pixel.");
  }

  return { valid: errors.length === 0, errors };
}

export function getValidPuzzles(puzzles: Puzzle[]): Puzzle[] {
  return puzzles.filter((puzzle) => validatePuzzle(puzzle).valid);
}
