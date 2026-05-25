# Puzzle Format

_Full documentation written in Phase 5._

## JSON schema

```ts
interface Puzzle {
  id: string;
  title: string;
  width: number;
  height: number;
  difficulty: "starter" | "easy" | "medium" | "hard" | "expert";
  pixels: (0 | 1)[][];
  tags?: string[];
}
```

Clues are **never stored** — they are always derived from `pixels` at runtime via `getRowClues` and `getColumnClues` in `src/core/clues.ts`.

## Daily selection

```ts
dailyIndex = hash("YYYY-MM-DD") % eligiblePuzzles.length;
```

Uses UTC date to avoid timezone issues.

## Adding a puzzle

Add an entry to `src/data/puzzles.ts`.
