# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

`p-xing.js` is a minimalist browser-based **pixel crossing** puzzle game. It targets GitHub Pages hosting and must be immediately playable with zero friction on first load.

Full spec: `p-xing-js-coding-agent-instructions.md`

## Commands

```bash
npm run dev           # Vite dev server
npm run build         # Production build to dist/
npm run preview       # Preview production build
npm run test          # Vitest unit tests (single run)
npm run test:watch    # Vitest in watch mode
npm run coverage      # Unit tests + coverage report
npm run e2e           # Playwright E2E tests
npm run lint          # ESLint
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only)
npm run typecheck     # tsc --noEmit
npm run check:terms   # Forbidden-term scan (node scripts/check-forbidden-terms.mjs)
npm run ci            # Full CI gate (all checks in sequence)
```

Run a single unit test file:

```bash
npx vitest run tests/unit/clues.test.ts
```

Run a single Playwright spec:

```bash
npx playwright test tests/e2e/first-play.spec.ts
```

## Terminology (strictly enforced)

**Forbidden word:** `nonogram` — must not appear in any `.ts`, `.js`, `.mjs`, `.html`, `.css`, `.md`, `.json`, `.yml`, or `.yaml` file (except the spec file itself, which is excluded from the CI check).

**Required terms:** pixel crossing, p-xing, puzzle, grid, clues, filled pixel, crossed pixel, empty pixel, row clues, column clues.

`npm run check:terms` enforces this in CI and will fail if the forbidden word is found.

## Architecture

The codebase separates core engine (pure logic, no DOM) from UI and input layers.

### Core engine (`src/core/`)

Pure TypeScript, no DOM access, no localStorage — fully unit-testable:

- `clues.ts` — `getLineClues`, `getRowClues`, `getColumnClues`: derive clues from pixel arrays, never stored
- `game-state.ts` — `GameState`, `Move`; pure functions: `createGameState`, `applyFill`, `applyCross`, `applyErase`, `undo`, `isSolved`
- `puzzle.ts` — `Puzzle` interface (id, title, width, height, difficulty, pixels, tags)
- `scoring.ts` — arcade score formula: `max(0, 100000 - floor(elapsedMs/10) - mistakes*5000 - hints*10000)`
- `daily.ts` — deterministic daily selection: `hash("YYYY-MM-DD") % eligiblePuzzles.length`
- `storage.ts` — localStorage wrapper (`p-xing.scores.v1`, `p-xing.theme`, `p-xing.lastPuzzle`); must handle corruption gracefully and fall back silently
- `theme.ts` — `ThemePreference = "system" | "light" | "dark"`, applied as `data-theme` on `<html>`
- `validation.ts` — initials validation (`/^[A-Z0-9]{3}$/`), puzzle validation

### Puzzle model

```ts
// Clues are always derived — never stored
interface Puzzle {
  id;
  title;
  width;
  height;
  difficulty;
  pixels: number[][];
  tags?;
}
type PlayerPixel = "unknown" | "filled" | "crossed";
// Solved when: every pixels[y][x]===1 is "filled", every pixels[y][x]===0 is "unknown"|"crossed"
```

### Input (`src/input/`)

- `pointer.ts` — desktop: left-click fill, right-click cross, drag support
- `keyboard.ts` — Ctrl+Z / U (undo), R (restart), ? (help)
- `long-press.ts` — mobile: tap→fill, long-press (450–600 ms)→cross; suppresses context menu; uses Pointer Events API

### UI (`src/ui/`)

DOM-dependent layer. Renders state from core; calls core functions on user actions. HTML/CSS grid for MVP (Canvas is a future option for large grids).

### Data flow

```
Puzzle JSON → core/game-state.ts (pure state) → ui/board.ts (render)
                    ↑
input/pointer.ts + input/keyboard.ts + input/long-press.ts (events)
```

## Key constraints

- **Vite base path:** `/p-xing.js/` (required for GitHub Pages under repo path)
- **TypeScript strict mode:** `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- **Coverage gates:** statements 90%, branches 85%, functions 90%, lines 90%; core logic targets ~100%
- **Timer:** starts on first player action (fill/cross/erase/hint), stops on solve
- **Completion rule:** only filled pixels must be marked filled; crossing empty pixels is optional
- **Mistakes (default mode):** wrong fill flashes briefly, reverts to unknown, increments mistake counter
- **Leaderboard:** local (localStorage) for MVP; initials exactly 3 chars `[A-Z0-9]`, lowercase auto-uppercased
- **Score modes:** `"classic"` and `"assisted"` are never mixed in leaderboard rankings

## Implementation phases (from spec)

1. Scaffold (Vite + TS + ESLint + Prettier + Vitest + Playwright + CI)
2. Core engine + unit tests
3. UI (grid, clues, timer, result, leaderboard, help, theme)
4. Input (desktop pointer, keyboard, mobile tap + long-press, E2E tests)
5. Polish (mobile layout, a11y, starter puzzles)
6. Deployment (Vite base path, Pages workflow, validate live URL)

## Non-goals for MVP

No user accounts, global online leaderboard, puzzle editor, multiplayer, WASM renderer, or backend service.
