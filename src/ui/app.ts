import type { Puzzle } from "../core/puzzle";
import type { GameState } from "../core/game-state";
import type { ThemePreference } from "../core/theme";
import {
  createGameState,
  applyFill,
  applyCross,
  undo,
} from "../core/game-state";
import { getDailyPuzzle } from "../core/daily";
import {
  applyTheme,
  getThemePreference,
  setThemePreference,
} from "../core/theme";
import { puzzles } from "../data/puzzles";
import { renderBoard, syncBoard, flashMistake } from "./board";
import { initHelp } from "./help";
import { showResult } from "./result";
import { initToolbar } from "./toolbar";

let state: GameState;
let puzzle: Puzzle;
let timerId: ReturnType<typeof setInterval> | null = null;
let boardEl: HTMLElement;
let timerEl: HTMLElement;
let resultDialog: HTMLDialogElement;

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function tickTimer(): void {
  if (state.startedAt === null) return;
  const elapsed = Date.now() - state.startedAt;
  timerEl.textContent = fmtTime(elapsed);
}

function stopTimer(): void {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer(): void {
  if (timerId !== null) return;
  timerId = setInterval(tickTimer, 500);
  timerEl.classList.add("running");
}

function resetTimer(): void {
  stopTimer();
  timerEl.textContent = "0:00";
  timerEl.classList.remove("running");
}

function restartGame(): void {
  state = createGameState(puzzle);
  syncBoard(boardEl, state.pixels);
  resetTimer();
}

function handleFill(x: number, y: number): void {
  const prevMistakes = state.mistakes;
  const prevCompleted = state.completedAt;
  state = applyFill(state, puzzle, x, y, Date.now());

  if (state.startedAt !== null && timerId === null) {
    startTimer();
  }

  if (state.mistakes > prevMistakes) {
    flashMistake(boardEl, x, y);
  } else {
    syncBoard(boardEl, state.pixels);
  }

  if (state.completedAt !== null && prevCompleted === null) {
    stopTimer();
    if (state.startedAt !== null && state.completedAt !== null) {
      timerEl.textContent = fmtTime(state.completedAt - state.startedAt);
    }
    showResult(resultDialog, {
      puzzle,
      state,
      onPlayAgain: restartGame,
    });
  }
}

function handleCross(x: number, y: number): void {
  state = applyCross(state, x, y, Date.now());

  if (state.startedAt !== null && timerId === null) {
    startTimer();
  }

  syncBoard(boardEl, state.pixels);
}

function handleUndo(): void {
  state = undo(state);
  syncBoard(boardEl, state.pixels);
}

function handleThemeToggle(): void {
  const current: ThemePreference = getThemePreference();
  const next: ThemePreference = current === "dark" ? "light" : "dark";
  setThemePreference(next);
}

export function initApp(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;

  // Apply saved or system theme immediately
  applyTheme(getThemePreference());

  // Select puzzle
  const p = getDailyPuzzle(puzzles) ?? puzzles[0];
  if (!p) {
    app.textContent = "No puzzles available.";
    return;
  }
  puzzle = p;
  state = createGameState(puzzle);

  // Build page structure
  app.innerHTML = `
    <header class="app-header">
      <span class="app-title">p-xing.js</span>
      <div class="toolbar" role="toolbar" aria-label="Game controls">
        <span
          class="toolbar-timer"
          aria-live="polite"
          aria-label="Elapsed time"
        >0:00</span>
        <button data-action="undo" aria-label="Undo last move">Undo</button>
        <button data-action="restart" aria-label="Restart puzzle">Restart</button>
        <button data-action="theme" aria-label="Toggle theme">Theme</button>
        <button data-action="help" aria-label="Open help">Help</button>
      </div>
    </header>
    <main class="app-main">
      <p class="puzzle-info">
        <strong>${puzzle.title}</strong>
        &nbsp;·&nbsp;${puzzle.difficulty}
        &nbsp;·&nbsp;${puzzle.width}&times;${puzzle.height}
      </p>
      <div id="board-container"></div>
    </main>
    <dialog id="dialog-help"></dialog>
    <dialog id="dialog-result"></dialog>
  `;

  timerEl = app.querySelector<HTMLElement>(".toolbar-timer")!;
  boardEl = app.querySelector<HTMLElement>("#board-container")!;
  const helpDialog = app.querySelector<HTMLDialogElement>("#dialog-help")!;
  resultDialog = app.querySelector<HTMLDialogElement>("#dialog-result")!;
  const helpBtn = app.querySelector<HTMLButtonElement>("[data-action='help']")!;
  const toolbar = app.querySelector<HTMLElement>(".toolbar")!;

  renderBoard(boardEl, puzzle, { onFill: handleFill, onCross: handleCross });
  initHelp(helpBtn, helpDialog);
  initToolbar(toolbar, {
    onUndo: handleUndo,
    onRestart: restartGame,
    onThemeToggle: handleThemeToggle,
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    const target = e.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      handleUndo();
      return;
    }

    switch (e.key.toLowerCase()) {
      case "u":
        handleUndo();
        break;
      case "r":
        restartGame();
        break;
      case "?":
        if (helpDialog.open) {
          helpDialog.close();
        } else {
          helpDialog.showModal();
        }
        break;
    }
  });
}
