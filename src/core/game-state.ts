import type { Puzzle, PlayerPixel } from "./puzzle";

export interface Move {
  x: number;
  y: number;
  before: PlayerPixel;
  after: PlayerPixel;
  at: number;
}

export interface GameState {
  puzzleId: string;
  width: number;
  height: number;
  pixels: PlayerPixel[][];
  startedAt: number | null;
  completedAt: number | null;
  mistakes: number;
  hints: number;
  history: Move[];
  mode: "classic" | "assisted";
}

function setPixel(
  pixels: PlayerPixel[][],
  x: number,
  y: number,
  value: PlayerPixel,
): PlayerPixel[][] {
  return pixels.map((row, ry) =>
    ry === y ? row.map((p, rx) => (rx === x ? value : p)) : row,
  );
}

export function createGameState(puzzle: Puzzle): GameState {
  const pixels: PlayerPixel[][] = Array.from({ length: puzzle.height }, () =>
    new Array<PlayerPixel>(puzzle.width).fill("unknown"),
  );
  return {
    puzzleId: puzzle.id,
    width: puzzle.width,
    height: puzzle.height,
    pixels,
    startedAt: null,
    completedAt: null,
    mistakes: 0,
    hints: 0,
    history: [],
    mode: "classic",
  };
}

export function applyFill(
  state: GameState,
  puzzle: Puzzle,
  x: number,
  y: number,
  now: number,
): GameState {
  const currentPixel = state.pixels[y]?.[x];
  if (currentPixel === undefined) return state;

  // Toggle: clicking a filled pixel erases it
  if (currentPixel === "filled") return applyErase(state, x, y, now);

  // Clicking a crossed pixel is a no-op for fill
  if (currentPixel === "crossed") return state;

  const startedAt = state.startedAt ?? now;
  const solutionPixel = puzzle.pixels[y]?.[x] ?? 0;

  if (solutionPixel !== 1) {
    // Wrong fill — increment mistake counter, pixel stays unknown
    return { ...state, startedAt, mistakes: state.mistakes + 1 };
  }

  // Correct fill
  const move: Move = { x, y, before: "unknown", after: "filled", at: now };
  const newState: GameState = {
    ...state,
    startedAt,
    pixels: setPixel(state.pixels, x, y, "filled"),
    history: [...state.history, move],
  };

  return isSolved(newState, puzzle)
    ? { ...newState, completedAt: now }
    : newState;
}

export function applyCross(
  state: GameState,
  x: number,
  y: number,
  now: number,
): GameState {
  const currentPixel = state.pixels[y]?.[x];
  if (currentPixel === undefined) return state;

  // Toggle: clicking a crossed pixel erases it
  if (currentPixel === "crossed") return applyErase(state, x, y, now);

  // Clicking a filled pixel is a no-op for cross
  if (currentPixel === "filled") return state;

  const startedAt = state.startedAt ?? now;
  const move: Move = { x, y, before: "unknown", after: "crossed", at: now };
  return {
    ...state,
    startedAt,
    pixels: setPixel(state.pixels, x, y, "crossed"),
    history: [...state.history, move],
  };
}

export function applyErase(
  state: GameState,
  x: number,
  y: number,
  now: number,
): GameState {
  const currentPixel = state.pixels[y]?.[x];
  if (currentPixel === undefined || currentPixel === "unknown") return state;

  const startedAt = state.startedAt ?? now;
  const move: Move = { x, y, before: currentPixel, after: "unknown", at: now };
  return {
    ...state,
    startedAt,
    pixels: setPixel(state.pixels, x, y, "unknown"),
    history: [...state.history, move],
  };
}

export function undo(state: GameState): GameState {
  if (state.history.length === 0) return state;
  const lastMove = state.history[state.history.length - 1];
  if (!lastMove) return state;

  return {
    ...state,
    pixels: setPixel(state.pixels, lastMove.x, lastMove.y, lastMove.before),
    history: state.history.slice(0, -1),
    completedAt: null,
  };
}

export function isSolved(state: GameState, puzzle: Puzzle): boolean {
  if (puzzle.width === 0 || puzzle.height === 0) return false;
  for (let y = 0; y < puzzle.height; y++) {
    const solutionRow = puzzle.pixels[y];
    const playerRow = state.pixels[y];
    if (!solutionRow || !playerRow) return false;
    for (let x = 0; x < puzzle.width; x++) {
      if (
        (solutionRow[x] ?? 0) === 1 &&
        (playerRow[x] ?? "unknown") !== "filled"
      ) {
        return false;
      }
    }
  }
  return true;
}
