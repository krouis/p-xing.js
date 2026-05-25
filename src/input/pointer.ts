export interface PointerCallbacks {
  onFill: (x: number, y: number) => void;
  onCross: (x: number, y: number) => void;
}

function cellFromEvent(e: MouseEvent): { x: number; y: number } | null {
  const el = (e.target as Element).closest<HTMLElement>(".cell");
  if (!el) return null;
  const x = Number(el.dataset["x"]);
  const y = Number(el.dataset["y"]);
  if (Number.isNaN(x) || Number.isNaN(y)) return null;
  return { x, y };
}

export function attachPointer(
  target: HTMLElement,
  callbacks: PointerCallbacks,
): () => void {
  let dragActive = false;
  let dragAction: "fill" | "cross" | null = null;
  let lastKey: string | null = null;

  function onMouseDown(e: MouseEvent) {
    const pos = cellFromEvent(e);
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
    lastKey = `${pos.x},${pos.y}`;
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragActive || !dragAction) return;
    const pos = cellFromEvent(e);
    if (!pos) return;
    const key = `${pos.x},${pos.y}`;
    if (key === lastKey) return;
    lastKey = key;
    if (dragAction === "fill") callbacks.onFill(pos.x, pos.y);
    else callbacks.onCross(pos.x, pos.y);
  }

  function onMouseUp() {
    dragActive = false;
    dragAction = null;
    lastKey = null;
  }

  function onContextMenu(e: Event) {
    e.preventDefault();
  }

  target.addEventListener("mousedown", onMouseDown);
  target.addEventListener("mousemove", onMouseMove);
  target.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("mouseup", onMouseUp);

  return () => {
    target.removeEventListener("mousedown", onMouseDown);
    target.removeEventListener("mousemove", onMouseMove);
    target.removeEventListener("contextmenu", onContextMenu);
    document.removeEventListener("mouseup", onMouseUp);
  };
}
