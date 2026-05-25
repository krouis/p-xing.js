# Puzzle Format

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

Keep starter puzzles compact and visually recognizable. The current starter set
covers 5x5, 7x7, 10x10, and 15x15 boards so mobile layout and clue rendering are
exercised before larger puzzle packs are added.

## Validation Rules

Each puzzle must:

- have a non-empty `id` and `title`
- use positive integer `width` and `height`
- include exactly `height` rows
- make every row exactly `width` pixels wide
- use only `0` and `1` pixel values
- include at least one filled pixel

Invalid puzzles are ignored by the app. If every puzzle is invalid, the page
shows a no-puzzles empty state.
