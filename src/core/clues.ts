import type { Puzzle, SolutionPixel } from "./puzzle";

export function getLineClues(line: SolutionPixel[]): number[] {
  const clues: number[] = [];
  let count = 0;
  for (const pixel of line) {
    if (pixel === 1) {
      count++;
    } else if (count > 0) {
      clues.push(count);
      count = 0;
    }
  }
  if (count > 0) clues.push(count);
  return clues.length > 0 ? clues : [0];
}

export function getRowClues(puzzle: Puzzle): number[][] {
  return puzzle.pixels.map((row) => getLineClues(row));
}

export function getColumnClues(puzzle: Puzzle): number[][] {
  return Array.from({ length: puzzle.width }, (_, x) => {
    const col: SolutionPixel[] = [];
    for (let y = 0; y < puzzle.height; y++) {
      col.push(puzzle.pixels[y]?.[x] ?? 0);
    }
    return getLineClues(col);
  });
}
