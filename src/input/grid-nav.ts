export function attachGridNav(
  boardContainer: HTMLElement,
  onFill: (x: number, y: number) => void,
  onCross: (x: number, y: number) => void,
): () => void {
  const grid = boardContainer.querySelector<HTMLElement>('[role="grid"]');
  if (!grid) return () => {};

  const cols = () => Number(grid.getAttribute("aria-colcount") ?? 1);
  const rows = () => Number(grid.getAttribute("aria-rowcount") ?? 1);

  function cell(x: number, y: number): HTMLElement | null {
    return grid!.querySelector<HTMLElement>(
      `.cell[data-x="${x}"][data-y="${y}"]`,
    );
  }

  function moveTo(fx: number, fy: number, dx: number, dy: number): void {
    const nx = fx + dx;
    const ny = fy + dy;
    if (nx < 0 || nx >= cols() || ny < 0 || ny >= rows()) return;
    cell(fx, fy)?.setAttribute("tabindex", "-1");
    const next = cell(nx, ny);
    if (!next) return;
    next.setAttribute("tabindex", "0");
    next.focus();
  }

  function onKeyDown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    if (!target.classList.contains("cell")) return;
    const x = Number(target.dataset["x"]);
    const y = Number(target.dataset["y"]);
    if (Number.isNaN(x) || Number.isNaN(y)) return;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveTo(x, y, 1, 0);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveTo(x, y, -1, 0);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveTo(x, y, 0, 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveTo(x, y, 0, -1);
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        onFill(x, y);
        break;
      case "x":
      case "X":
        e.preventDefault();
        onCross(x, y);
        break;
    }
  }

  grid.addEventListener("keydown", onKeyDown);
  return () => grid.removeEventListener("keydown", onKeyDown);
}
