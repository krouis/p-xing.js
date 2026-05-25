import { getTopScores } from "../core/storage";
import type { ScoreMode } from "../core/scoring";

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function renderLeaderboard(
  container: HTMLElement,
  puzzleId: string,
  mode: ScoreMode,
): void {
  const scores = getTopScores(puzzleId, mode, 10);

  if (scores.length === 0) {
    container.innerHTML = `<p class="leaderboard-empty">No scores yet — be the first!</p>`;
    return;
  }

  const rows = scores
    .map(
      (s, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="initials">${s.initials}</td>
        <td>${fmtTime(s.elapsedMs)}</td>
        <td>${s.mistakes}</td>
        <td class="score">${s.score.toLocaleString()}</td>
      </tr>`,
    )
    .join("");

  container.innerHTML = `
    <p class="leaderboard-title">Local scores · ${mode}</p>
    <table class="leaderboard-table">
      <thead>
        <tr>
          <th>#</th><th>Name</th><th>Time</th><th>Err</th><th>Score</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
