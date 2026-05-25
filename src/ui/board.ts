import type { Puzzle, PlayerPixel } from "../core/puzzle";
import { getRowClues, getColumnClues } from "../core/clues";

export interface BoardCallbacks {
  onFill: (x: number, y: number) => void;
  onCross: (x: number, y: number) => void;
}

function cellAt(
  container: HTMLElement,
  x: number,
  y: number,
): HTMLElement | null {
  return container.querySelector<HTMLElement>(
    `.cell[data-x="${x}"][data-y="${y}"]`,
  );
}

export function renderBoard(
  container: HTMLElement,
  puzzle: Puzzle,
  callbacks: BoardCallbacks,
): void {
  const rowClues = getRowClues(puzzle);
  const colClues = getColumnClues(puzzle);

  const board = document.createElement("div");
  board.className = "board";

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
    clue.forEach((n) => {
      const span = document.createElement("span");
      span.textContent = String(n);
      div.appendChild(span);
    });
    rowCluesEl.appendChild(div);
  });
  board.appendChild(rowCluesEl);

  // Cells grid
  const cellsEl = document.createElement("div");
  cellsEl.className = "board-cells";
  cellsEl.style.gridTemplateColumns = `repeat(${puzzle.width}, var(--cell-size))`;
  cellsEl.setAttribute("role", "grid");
  cellsEl.setAttribute("aria-label", "Pixel crossing grid");

  for (let y = 0; y < puzzle.height; y++) {
    for (let x = 0; x < puzzle.width; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset["x"] = String(x);
      cell.dataset["y"] = String(y);
      cell.dataset["state"] = "unknown";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Row ${y + 1} column ${x + 1}`);
      cellsEl.appendChild(cell);
    }
  }
  board.appendChild(cellsEl);

  // Drag tracking
  let dragActive = false;
  let dragAction: "fill" | "cross" | null = null;
  let lastDragKey: string | null = null;

  function posFromEvent(e: MouseEvent): { x: number; y: number } | null {
    const el = (e.target as Element).closest<HTMLElement>(".cell");
    if (!el) return null;
    const x = Number(el.dataset["x"]);
    const y = Number(el.dataset["y"]);
    if (Number.isNaN(x) || Number.isNaN(y)) return null;
    return { x, y };
  }

  cellsEl.addEventListener("mousedown", (e: MouseEvent) => {
    const pos = posFromEvent(e);
    if (!pos) return;
    e.preventDefault();
    if (e.button === 2) {
      dragAction = "cross";
      callbacks.onCross(pos.x, pos.y);
    } else if (e.button === 0) {
      dragAction = "fill";
      callbacks.onFill(pos.x, pos.y);
    } else {
      return;
    }
    dragActive = true;
    lastDragKey = `${pos.x},${pos.y}`;
  });

  cellsEl.addEventListener("mousemove", (e: MouseEvent) => {
    if (!dragActive || !dragAction) return;
    const pos = posFromEvent(e);
    if (!pos) return;
    const key = `${pos.x},${pos.y}`;
    if (key === lastDragKey) return;
    lastDragKey = key;
    if (dragAction === "fill") {
      callbacks.onFill(pos.x, pos.y);
    } else {
      callbacks.onCross(pos.x, pos.y);
    }
  });

  cellsEl.addEventListener("contextmenu", (e: MouseEvent) => {
    e.preventDefault();
  });

  document.addEventListener("mouseup", () => {
    dragActive = false;
    dragAction = null;
    lastDragKey = null;
  });

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
    cell.dataset["state"] = pixels[y]?.[x] ?? "unknown";
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
