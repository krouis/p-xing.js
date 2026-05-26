export interface LongPressOptions {
  thresholdMs: number;
  moveTolerancePx: number;
  onTap: (x: number, y: number) => void;
  onLongPress: (x: number, y: number) => void;
}

function cellFromPointer(e: PointerEvent): { x: number; y: number } | null {
  const el = (e.target as Element).closest<HTMLElement>(".cell");
  if (!el) return null;
  const x = Number(el.dataset["x"]);
  const y = Number(el.dataset["y"]);
  if (Number.isNaN(x) || Number.isNaN(y)) return null;
  return { x, y };
}

export function attachLongPress(
  target: HTMLElement,
  options: LongPressOptions,
): () => void {
  const { thresholdMs, moveTolerancePx, onTap, onLongPress } = options;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;
  let activeCell: { x: number; y: number } | null = null;
  let pressEl: HTMLElement | null = null;
  let longPressFired = false;

  function cancel() {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    pressEl?.classList.remove("pressing");
    pressEl = null;
    activeCell = null;
    longPressFired = false;
  }

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType !== "touch") return;
    const cell = cellFromPointer(e);
    if (!cell) return;
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    activeCell = cell;
    pressEl = (e.target as Element).closest<HTMLElement>(".cell");
    pressEl?.classList.add("pressing");
    longPressFired = false;
    timerId = setTimeout(() => {
      if (!activeCell) return;
      longPressFired = true;
      onLongPress(activeCell.x, activeCell.y);
      cancel();
    }, thresholdMs);
  }

  function onPointerMove(e: PointerEvent) {
    if (e.pointerType !== "touch" || !activeCell) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.sqrt(dx * dx + dy * dy) > moveTolerancePx) {
      cancel();
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (e.pointerType !== "touch") return;
    if (!activeCell || longPressFired) {
      cancel();
      return;
    }
    const cell = activeCell;
    cancel();
    onTap(cell.x, cell.y);
  }

  function onPointerCancel() {
    cancel();
  }

  function onContextMenu(e: Event) {
    e.preventDefault();
  }

  target.addEventListener("pointerdown", onPointerDown);
  target.addEventListener("pointermove", onPointerMove);
  target.addEventListener("pointerup", onPointerUp);
  target.addEventListener("pointercancel", onPointerCancel);
  target.addEventListener("contextmenu", onContextMenu);

  return () => {
    target.removeEventListener("pointerdown", onPointerDown);
    target.removeEventListener("pointermove", onPointerMove);
    target.removeEventListener("pointerup", onPointerUp);
    target.removeEventListener("pointercancel", onPointerCancel);
    target.removeEventListener("contextmenu", onContextMenu);
    if (timerId !== null) clearTimeout(timerId);
  };
}
