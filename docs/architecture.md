# Architecture

## Overview

```
src/core/    — pure logic, no DOM, fully unit-tested
src/input/   — pointer, keyboard, long-press event handling
src/ui/      — DOM rendering, wires core ↔ input
src/data/    — puzzle definitions
```

The app keeps game rules in pure TypeScript modules and leaves browser APIs in
the UI, input, storage, and theme boundaries. That split keeps clue generation,
scoring, validation, and state transitions easy to test without rendering the
page.

## Data flow

```
Puzzle JSON → core/game-state (pure state) → ui/board (render)
                     ↑
input/pointer + input/keyboard + input/long-press (events)
```

## Storage

- `p-xing.scores.v1` — local leaderboard entries
- `p-xing.theme` — theme preference
- `p-xing.lastPuzzle` — last played puzzle id

## Error Handling

Puzzle data is validated before the daily puzzle is selected. If no playable
puzzles are available, the app renders an empty state instead of attempting to
draw a broken board.

Storage and theme reads catch unavailable or corrupt browser storage and fall
back silently so the puzzle remains playable.

## Rendering

The board is rendered as DOM elements with CSS grid. Row and column clues are
derived from puzzle pixels at runtime. Cell labels are synchronized with player
state so assistive technology can identify row, column, and current state.
