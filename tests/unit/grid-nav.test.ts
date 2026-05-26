import { describe, it, expect, vi, afterEach } from "vitest";
import { attachGridNav } from "../../src/input/grid-nav";

function makeGrid(w: number, h: number): HTMLElement {
  const container = document.createElement("div");
  const grid = document.createElement("div");
  grid.setAttribute("role", "grid");
  grid.setAttribute("aria-colcount", String(w));
  grid.setAttribute("aria-rowcount", String(h));

  for (let y = 0; y < h; y++) {
    const row = document.createElement("div");
    row.setAttribute("role", "row");
    for (let x = 0; x < w; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset["x"] = String(x);
      cell.dataset["y"] = String(y);
      cell.setAttribute("tabindex", x === 0 && y === 0 ? "0" : "-1");
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
  container.appendChild(grid);
  document.body.appendChild(container);
  return container;
}

function cell(container: HTMLElement, x: number, y: number): HTMLElement {
  return container.querySelector<HTMLElement>(
    `.cell[data-x="${x}"][data-y="${y}"]`,
  )!;
}

function key(el: HTMLElement, k: string): void {
  el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("attachGridNav", () => {
  it("ArrowRight moves focus right", () => {
    const c = makeGrid(3, 3);
    attachGridNav(c, vi.fn(), vi.fn());
    key(cell(c, 0, 0), "ArrowRight");
    expect(cell(c, 1, 0).getAttribute("tabindex")).toBe("0");
    expect(cell(c, 0, 0).getAttribute("tabindex")).toBe("-1");
  });

  it("ArrowLeft moves focus left", () => {
    const c = makeGrid(3, 3);
    attachGridNav(c, vi.fn(), vi.fn());
    cell(c, 1, 0).setAttribute("tabindex", "0");
    key(cell(c, 1, 0), "ArrowLeft");
    expect(cell(c, 0, 0).getAttribute("tabindex")).toBe("0");
  });

  it("ArrowDown moves focus down", () => {
    const c = makeGrid(3, 3);
    attachGridNav(c, vi.fn(), vi.fn());
    key(cell(c, 0, 0), "ArrowDown");
    expect(cell(c, 0, 1).getAttribute("tabindex")).toBe("0");
  });

  it("ArrowUp moves focus up", () => {
    const c = makeGrid(3, 3);
    attachGridNav(c, vi.fn(), vi.fn());
    cell(c, 0, 1).setAttribute("tabindex", "0");
    key(cell(c, 0, 1), "ArrowUp");
    expect(cell(c, 0, 0).getAttribute("tabindex")).toBe("0");
  });

  it("ArrowRight at right edge does nothing", () => {
    const c = makeGrid(3, 3);
    attachGridNav(c, vi.fn(), vi.fn());
    cell(c, 2, 0).setAttribute("tabindex", "0");
    key(cell(c, 2, 0), "ArrowRight");
    expect(cell(c, 2, 0).getAttribute("tabindex")).toBe("0");
  });

  it("ArrowLeft at left edge does nothing", () => {
    const c = makeGrid(3, 3);
    attachGridNav(c, vi.fn(), vi.fn());
    key(cell(c, 0, 0), "ArrowLeft");
    expect(cell(c, 0, 0).getAttribute("tabindex")).toBe("0");
  });

  it("ArrowDown at bottom edge does nothing", () => {
    const c = makeGrid(3, 3);
    attachGridNav(c, vi.fn(), vi.fn());
    cell(c, 0, 2).setAttribute("tabindex", "0");
    key(cell(c, 0, 2), "ArrowDown");
    expect(cell(c, 0, 2).getAttribute("tabindex")).toBe("0");
  });

  it("ArrowUp at top edge does nothing", () => {
    const c = makeGrid(3, 3);
    attachGridNav(c, vi.fn(), vi.fn());
    key(cell(c, 0, 0), "ArrowUp");
    expect(cell(c, 0, 0).getAttribute("tabindex")).toBe("0");
  });

  it("Space triggers onFill for the focused cell", () => {
    const c = makeGrid(3, 3);
    const onFill = vi.fn();
    attachGridNav(c, onFill, vi.fn());
    key(cell(c, 0, 0), " ");
    expect(onFill).toHaveBeenCalledWith(0, 0);
  });

  it("Enter triggers onFill", () => {
    const c = makeGrid(3, 3);
    const onFill = vi.fn();
    attachGridNav(c, onFill, vi.fn());
    cell(c, 1, 1).setAttribute("tabindex", "0");
    key(cell(c, 1, 1), "Enter");
    expect(onFill).toHaveBeenCalledWith(1, 1);
  });

  it("x triggers onCross", () => {
    const c = makeGrid(3, 3);
    const onCross = vi.fn();
    attachGridNav(c, vi.fn(), onCross);
    key(cell(c, 0, 0), "x");
    expect(onCross).toHaveBeenCalledWith(0, 0);
  });

  it("X triggers onCross", () => {
    const c = makeGrid(3, 3);
    const onCross = vi.fn();
    attachGridNav(c, vi.fn(), onCross);
    key(cell(c, 0, 0), "X");
    expect(onCross).toHaveBeenCalledWith(0, 0);
  });

  it("ignores keydown when target is not a cell", () => {
    const c = makeGrid(3, 3);
    const onFill = vi.fn();
    attachGridNav(c, onFill, vi.fn());
    const grid = c.querySelector<HTMLElement>('[role="grid"]')!;
    grid.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(onFill).not.toHaveBeenCalled();
  });

  it("detach removes the listener", () => {
    const c = makeGrid(3, 3);
    const onFill = vi.fn();
    const detach = attachGridNav(c, onFill, vi.fn());
    detach();
    key(cell(c, 0, 0), " ");
    expect(onFill).not.toHaveBeenCalled();
  });

  it("returns noop detach when grid is absent", () => {
    const c = document.createElement("div");
    document.body.appendChild(c);
    expect(() => attachGridNav(c, vi.fn(), vi.fn())()).not.toThrow();
  });
});
