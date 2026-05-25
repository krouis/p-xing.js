import type { Puzzle } from "../core/puzzle";
import type { GameState } from "../core/game-state";
import { calculateScore } from "../core/scoring";
import { saveScore } from "../core/storage";
import { validateInitials, normalizeInitials } from "../core/validation";
import { renderLeaderboard } from "./leaderboard";

export interface ResultOptions {
  puzzle: Puzzle;
  state: GameState;
  onPlayAgain: () => void;
}

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function showResult(
  dialog: HTMLDialogElement,
  options: ResultOptions,
): void {
  const { puzzle, state, onPlayAgain } = options;

  const elapsedMs =
    state.completedAt != null && state.startedAt != null
      ? state.completedAt - state.startedAt
      : 0;

  const score = calculateScore(elapsedMs, state.mistakes, state.hints);
  const { mode } = state;

  dialog.innerHTML = `
    <div class="dialog-header">
      <h2 class="dialog-title">Puzzle solved!</h2>
      <button class="dialog-close" aria-label="Close">&times;</button>
    </div>
    <div class="dialog-body">
      <div class="result-score">
        <span class="result-score-value">${score.toLocaleString()}</span>
        <span class="result-score-label">score</span>
      </div>
      <div class="result-stats">
        <div class="result-stat">
          <span class="result-stat-value">${fmtTime(elapsedMs)}</span>
          <span class="result-stat-label">time</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-value">${state.mistakes}</span>
          <span class="result-stat-label">mistakes</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-value">${state.hints}</span>
          <span class="result-stat-label">hints</span>
        </div>
      </div>
      <div class="result-initials-row">
        <input
          type="text"
          class="result-initials-input"
          maxlength="3"
          placeholder="AAA"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
          aria-label="Your initials, 3 characters"
        />
        <button class="result-submit-btn">Save</button>
      </div>
      <div class="result-leaderboard"></div>
      <button class="result-play-again-btn">Play again</button>
    </div>
  `;

  const input = dialog.querySelector<HTMLInputElement>(
    ".result-initials-input",
  );
  const submitBtn =
    dialog.querySelector<HTMLButtonElement>(".result-submit-btn");
  const closeBtn = dialog.querySelector<HTMLButtonElement>(".dialog-close");
  const playAgainBtn = dialog.querySelector<HTMLButtonElement>(
    ".result-play-again-btn",
  );
  const lbEl = dialog.querySelector<HTMLElement>(".result-leaderboard");

  if (lbEl) {
    renderLeaderboard(lbEl, puzzle.id, mode);
  }

  // Auto-uppercase and strip disallowed characters
  input?.addEventListener("input", () => {
    if (!input) return;
    const start = input.selectionStart ?? input.value.length;
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const clampedPos = Math.min(start, input.value.length);
    input.setSelectionRange(clampedPos, clampedPos);
  });

  function submit(): void {
    if (!input || !submitBtn) return;
    if (!validateInitials(input.value)) {
      input.focus();
      return;
    }
    saveScore({
      puzzleId: puzzle.id,
      mode,
      initials: normalizeInitials(input.value),
      elapsedMs,
      mistakes: state.mistakes,
      hints: state.hints,
      score,
      completedAt: new Date().toISOString(),
    });
    submitBtn.disabled = true;
    submitBtn.textContent = "Saved!";
    if (lbEl) {
      renderLeaderboard(lbEl, puzzle.id, mode);
    }
  }

  submitBtn?.addEventListener("click", submit);
  input?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter") submit();
  });

  closeBtn?.addEventListener("click", () => dialog.close());

  playAgainBtn?.addEventListener("click", () => {
    dialog.close();
    onPlayAgain();
  });

  dialog.showModal();
  input?.focus();
}
