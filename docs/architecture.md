# Architecture

_Full documentation written in Phase 5._

## Overview

```
src/core/    — pure logic, no DOM, fully unit-tested
src/input/   — pointer, keyboard, long-press event handling
src/ui/      — DOM rendering, wires core ↔ input
src/data/    — puzzle definitions
```

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
