import type { Puzzle, PlayerPixel } from "../core/puzzle";
import { getRowClues, getColumnClues } from "../core/clues";

function cellAt(
  container: HTMLElement,
  x: number,
  y: number,
): HTMLElement | null {
  return container.querySelector<HTMLElement>(
    `.cell[data-x="${x}"][data-y="${y}"]`,
  );
}

function stateLabel(pixel: PlayerPixel): string {
  switch (pixel) {
    case "filled":
      return "filled";
    case "crossed":
      return "crossed";
    case "unknown":
      return "unknown";
  }
}

export function renderBoard(container: HTMLElement, puzzle: Puzzle): void {
  const rowClues = getRowClues(puzzle);
  const colClues = getColumnClues(puzzle);

  const board = document.createElement("div");
  board.className = "board";
  if (puzzle.width >= 15) {
    board.classList.add("board--large");
  } else if (puzzle.width >= 10) {
    board.classList.add("board--medium");
  }
  board.style.setProperty("--puzzle-width", String(puzzle.width));
  board.style.setProperty("--puzzle-height", String(puzzle.height));

  // Corner (top-left spacer)
  const corner = document.createElement("div");
  corner.className = "board-corner";
  board.appendChild(corner);

  // Column clues (top row)
  const colCluesEl = document.createElement("div");
  colCluesEl.className = "board-col-clues";
  colCluesEl.style.gridTemplateColumns = `repeat(${puzzle.width}, var(--cell-size))`;
  colClues.forEach((clue, x) => {
    const div = document.createElement("div");
    div.className = "col-clue";
    div.dataset["index"] = String(x);
    div.setAttribute("aria-label", `Column ${x + 1} clues ${clue.join(" ")}`);
    clue.forEach((n) => {
      const span = document.createElement("span");
      span.textContent = String(n);
      div.appendChild(span);
    });
    colCluesEl.appendChild(div);
  });
  board.appendChild(colCluesEl);

  // Row clues (left column)
  const rowCluesEl = document.createElement("div");
  rowCluesEl.className = "board-row-clues";
  rowCluesEl.style.gridTemplateRows = `repeat(${puzzle.height}, var(--cell-size))`;
  rowClues.forEach((clue, y) => {
    const div = document.createElement("div");
    div.className = "row-clue";
    div.dataset["index"] = String(y);
    div.setAttribute("aria-label", `Row ${y + 1} clues ${clue.join(" ")}`);
    clue.forEach((n) => {
      const span = document.createElement("span");
      span.textContent = String(n);
      div.appendChild(span);
    });
    rowCluesEl.appendChild(div);
  });
  board.appendChild(rowCluesEl);

  // Cells grid — each row wrapped in role="row" (display:contents) so the
  // CSS grid still lays cells out flat while satisfying ARIA grid semantics.
  const cellsEl = document.createElement("div");
  cellsEl.className = "board-cells";
  cellsEl.style.gridTemplateColumns = `repeat(${puzzle.width}, var(--cell-size))`;
  cellsEl.setAttribute("role", "grid");
  cellsEl.setAttribute("aria-label", "Pixel crossing grid");
  cellsEl.setAttribute("aria-rowcount", String(puzzle.height));
  cellsEl.setAttribute("aria-colcount", String(puzzle.width));

  for (let y = 0; y < puzzle.height; y++) {
    const rowEl = document.createElement("div");
    rowEl.className = "board-row";
    rowEl.setAttribute("role", "row");
    rowEl.setAttribute("aria-rowindex", String(y + 1));

    for (let x = 0; x < puzzle.width; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset["x"] = String(x);
      cell.dataset["y"] = String(y);
      cell.dataset["state"] = "unknown";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-colindex", String(x + 1));
      cell.setAttribute("aria-label", `Row ${y + 1} column ${x + 1}, unknown`);
      cell.setAttribute("tabindex", x === 0 && y === 0 ? "0" : "-1");
      rowEl.appendChild(cell);
    }
    cellsEl.appendChild(rowEl);
  }
  board.appendChild(cellsEl);

  container.innerHTML = "";
  container.appendChild(board);
}

export function syncBoard(
  container: HTMLElement,
  pixels: PlayerPixel[][],
): void {
  container.querySelectorAll<HTMLElement>(".cell").forEach((cell) => {
    const x = Number(cell.dataset["x"]);
    const y = Number(cell.dataset["y"]);
    if (Number.isNaN(x) || Number.isNaN(y)) return;
    const pixel = pixels[y]?.[x] ?? "unknown";
    cell.dataset["state"] = pixel;
    cell.setAttribute(
      "aria-label",
      `Row ${y + 1} column ${x + 1}, ${stateLabel(pixel)}`,
    );
  });
}

export function flashMistake(
  container: HTMLElement,
  x: number,
  y: number,
): void {
  const cell = cellAt(container, x, y);
  if (!cell) return;
  cell.classList.remove("mistake");
  void cell.offsetWidth; // force reflow to restart animation
  cell.classList.add("mistake");
  cell.addEventListener(
    "animationend",
    () => cell.classList.remove("mistake"),
    {
      once: true,
    },
  );
}
