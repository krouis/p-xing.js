import { describe, it, expect } from "vitest";
import {
  createGameState,
  applyFill,
  applyCross,
  applyErase,
  undo,
  isSolved,
} from "../../src/core/game-state";
import type { Puzzle } from "../../src/core/puzzle";

// 2×2: (0,0)=filled, (1,1)=filled; (1,0) and (0,1) are empty
const P: Puzzle = {
  id: "p2x2",
  title: "2×2",
  width: 2,
  height: 2,
  difficulty: "starter",
  pixels: [
    [1, 0],
    [0, 1],
  ],
};

// 1×1 all-empty puzzle
const EMPTY_CELL: Puzzle = {
  id: "empty",
  title: "Empty",
  width: 1,
  height: 1,
  difficulty: "starter",
  pixels: [[0]],
};

// Zero-size puzzle
const ZERO_SIZE: Puzzle = {
  id: "zero",
  title: "Zero",
  width: 0,
  height: 0,
  difficulty: "starter",
  pixels: [],
};

describe("createGameState", () => {
  it("initialises every pixel to unknown", () => {
    const s = createGameState(P);
    for (let y = 0; y < P.height; y++) {
      for (let x = 0; x < P.width; x++) {
        expect(s.pixels[y]?.[x]).toBe("unknown");
      }
    }
  });

  it("copies id, width, and height from the puzzle", () => {
    const s = createGameState(P);
    expect(s.puzzleId).toBe("p2x2");
    expect(s.width).toBe(2);
    expect(s.height).toBe(2);
  });

  it("starts with zero counters and empty history", () => {
    const s = createGameState(P);
    expect(s.mistakes).toBe(0);
    expect(s.hints).toBe(0);
    expect(s.history).toHaveLength(0);
  });

  it("starts with null timer fields and classic mode", () => {
    const s = createGameState(P);
    expect(s.startedAt).toBeNull();
    expect(s.completedAt).toBeNull();
    expect(s.mode).toBe("classic");
  });
});

describe("applyFill", () => {
  it("fills a correct pixel", () => {
    const s = createGameState(P);
    const next = applyFill(s, P, 0, 0, 1000);
    expect(next.pixels[0]?.[0]).toBe("filled");
  });

  it("starts the timer on the first action", () => {
    const s = createGameState(P);
    const next = applyFill(s, P, 0, 0, 1000);
    expect(next.startedAt).toBe(1000);
  });

  it("does not restart an already-running timer", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    s = applyFill(s, P, 1, 1, 2000);
    expect(s.startedAt).toBe(1000);
  });

  it("increments mistakes for a wrong fill and leaves pixel unknown", () => {
    const s = createGameState(P);
    const next = applyFill(s, P, 1, 0, 1000); // (1,0) is 0 in solution
    expect(next.mistakes).toBe(1);
    expect(next.pixels[0]?.[1]).toBe("unknown");
  });

  it("erases a filled pixel on a second click (toggle)", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    s = applyFill(s, P, 0, 0, 2000);
    expect(s.pixels[0]?.[0]).toBe("unknown");
  });

  it("does nothing to a crossed pixel", () => {
    let s = createGameState(P);
    s = applyCross(s, 1, 0, 1000);
    const next = applyFill(s, P, 1, 0, 2000);
    expect(next.pixels[0]?.[1]).toBe("crossed");
    expect(next.mistakes).toBe(0);
  });

  it("does nothing for out-of-bounds coordinates", () => {
    const s = createGameState(P);
    const next = applyFill(s, P, 99, 99, 1000);
    expect(next).toBe(s);
  });

  it("adds the move to history", () => {
    const s = createGameState(P);
    const next = applyFill(s, P, 0, 0, 1000);
    expect(next.history).toHaveLength(1);
    expect(next.history[0]?.after).toBe("filled");
    expect(next.history[0]?.before).toBe("unknown");
  });

  it("sets completedAt when the last required pixel is filled", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    s = applyFill(s, P, 1, 1, 2000);
    expect(s.completedAt).toBe(2000);
  });

  it("does not set completedAt when the puzzle is still unsolved", () => {
    const s = applyFill(createGameState(P), P, 0, 0, 1000);
    expect(s.completedAt).toBeNull();
  });
});

describe("applyCross", () => {
  it("crosses an unknown pixel", () => {
    const s = createGameState(P);
    const next = applyCross(s, 1, 0, 1000);
    expect(next.pixels[0]?.[1]).toBe("crossed");
  });

  it("starts the timer on the first cross", () => {
    const s = createGameState(P);
    const next = applyCross(s, 1, 0, 1000);
    expect(next.startedAt).toBe(1000);
  });

  it("erases a crossed pixel on a second click (toggle)", () => {
    let s = createGameState(P);
    s = applyCross(s, 1, 0, 1000);
    s = applyCross(s, 1, 0, 2000);
    expect(s.pixels[0]?.[1]).toBe("unknown");
  });

  it("does nothing to a filled pixel", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    const next = applyCross(s, 0, 0, 2000);
    expect(next.pixels[0]?.[0]).toBe("filled");
  });

  it("does nothing for out-of-bounds coordinates", () => {
    const s = createGameState(P);
    expect(applyCross(s, 99, 99, 1000)).toBe(s);
  });

  it("adds the move to history", () => {
    const s = createGameState(P);
    const next = applyCross(s, 1, 0, 1000);
    expect(next.history).toHaveLength(1);
    expect(next.history[0]?.after).toBe("crossed");
  });
});

describe("applyErase", () => {
  it("erases a filled pixel to unknown", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    s = applyErase(s, 0, 0, 2000);
    expect(s.pixels[0]?.[0]).toBe("unknown");
  });

  it("erases a crossed pixel to unknown", () => {
    let s = createGameState(P);
    s = applyCross(s, 1, 0, 1000);
    s = applyErase(s, 1, 0, 2000);
    expect(s.pixels[0]?.[1]).toBe("unknown");
  });

  it("does nothing to an already-unknown pixel", () => {
    const s = createGameState(P);
    expect(applyErase(s, 0, 0, 1000)).toBe(s);
  });

  it("does nothing for out-of-bounds coordinates", () => {
    const s = createGameState(P);
    expect(applyErase(s, 99, 99, 1000)).toBe(s);
  });

  it("starts the timer on first erase of a non-unknown pixel", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    // Manually reset startedAt to simulate erasing as first action
    s = { ...s, startedAt: null };
    const next = applyErase(s, 0, 0, 2000);
    expect(next.startedAt).toBe(2000);
  });

  it("adds the move to history", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    s = applyErase(s, 0, 0, 2000);
    expect(s.history).toHaveLength(2);
    expect(s.history[1]?.after).toBe("unknown");
  });
});

describe("undo", () => {
  it("does nothing when history is empty", () => {
    const s = createGameState(P);
    expect(undo(s)).toBe(s);
  });

  it("reverts the last fill", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    s = undo(s);
    expect(s.pixels[0]?.[0]).toBe("unknown");
    expect(s.history).toHaveLength(0);
  });

  it("reverts the last cross", () => {
    let s = createGameState(P);
    s = applyCross(s, 1, 0, 1000);
    s = undo(s);
    expect(s.pixels[0]?.[1]).toBe("unknown");
  });

  it("reverts the last erase", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    s = applyErase(s, 0, 0, 2000);
    s = undo(s);
    expect(s.pixels[0]?.[0]).toBe("filled");
  });

  it("clears completedAt after undoing the winning move", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    s = applyFill(s, P, 1, 1, 2000);
    expect(s.completedAt).not.toBeNull();
    s = undo(s);
    expect(s.completedAt).toBeNull();
  });

  it("undoes moves one at a time", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    s = applyCross(s, 1, 0, 2000);
    s = undo(s);
    expect(s.history).toHaveLength(1);
    expect(s.pixels[0]?.[1]).toBe("unknown"); // cross reverted
    expect(s.pixels[0]?.[0]).toBe("filled"); // fill still present
  });
});

describe("isSolved", () => {
  it("returns false for a fresh game", () => {
    expect(isSolved(createGameState(P), P)).toBe(false);
  });

  it("returns true when all solution pixels are filled", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    s = applyFill(s, P, 1, 1, 2000);
    expect(isSolved(s, P)).toBe(true);
  });

  it("returns true when filled pixels are filled and empty pixels are crossed", () => {
    let s = createGameState(P);
    s = applyFill(s, P, 0, 0, 1000);
    s = applyFill(s, P, 1, 1, 2000);
    s = applyCross(s, 1, 0, 3000);
    s = applyCross(s, 0, 1, 4000);
    expect(isSolved(s, P)).toBe(true);
  });

  it("returns false when a required pixel is crossed instead of filled", () => {
    let s = createGameState(P);
    s = applyCross(s, 0, 0, 1000); // (0,0) is solution=1, but we crossed it
    s = applyFill(s, P, 1, 1, 2000);
    expect(isSolved(s, P)).toBe(false);
  });

  it("returns false for a zero-size puzzle", () => {
    expect(isSolved(createGameState(ZERO_SIZE), ZERO_SIZE)).toBe(false);
  });

  it("returns true for an all-empty puzzle when pixels are filled (trivially)", () => {
    // EMPTY_CELL has one cell with solution=0; it's solved when not filled
    const s = createGameState(EMPTY_CELL);
    expect(isSolved(s, EMPTY_CELL)).toBe(true); // no filled pixels required
  });
});
