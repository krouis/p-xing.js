import { describe, it, expect, vi, afterEach } from "vitest";
import { attachPointer } from "../../src/input/pointer";

function makeBoard(): { container: HTMLElement; cell: HTMLElement } {
  const container = document.createElement("div");
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.dataset["x"] = "3";
  cell.dataset["y"] = "1";
  container.appendChild(cell);
  document.body.appendChild(container);
  return { container, cell };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("attachPointer", () => {
  it("left-click calls onFill with cell coordinates", () => {
    const { container, cell } = makeBoard();
    const onFill = vi.fn();
    const detach = attachPointer(container, { onFill, onCross: vi.fn() });
    cell.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, button: 0 }),
    );
    expect(onFill).toHaveBeenCalledWith(3, 1);
    detach();
  });

  it("right-click calls onCross with cell coordinates", () => {
    const { container, cell } = makeBoard();
    const onCross = vi.fn();
    const detach = attachPointer(container, { onFill: vi.fn(), onCross });
    cell.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, button: 2 }),
    );
    expect(onCross).toHaveBeenCalledWith(3, 1);
    detach();
  });

  it("middle-click does nothing", () => {
    const { container, cell } = makeBoard();
    const onFill = vi.fn();
    const onCross = vi.fn();
    const detach = attachPointer(container, { onFill, onCross });
    cell.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, button: 1 }),
    );
    expect(onFill).not.toHaveBeenCalled();
    expect(onCross).not.toHaveBeenCalled();
    detach();
  });

  it("contextmenu is prevented on the target", () => {
    const { container } = makeBoard();
    const detach = attachPointer(container, {
      onFill: vi.fn(),
      onCross: vi.fn(),
    });
    const e = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
    detach();
  });

  it("drag calls onFill for each new cell entered", () => {
    const { container } = makeBoard();
    const cell2 = document.createElement("div");
    cell2.className = "cell";
    cell2.dataset["x"] = "4";
    cell2.dataset["y"] = "1";
    container.appendChild(cell2);

    const onFill = vi.fn();
    const detach = attachPointer(container, { onFill, onCross: vi.fn() });

    container
      .querySelector<HTMLElement>('.cell[data-x="3"]')!
      .dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    cell2.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));

    expect(onFill).toHaveBeenCalledTimes(2);
    expect(onFill).toHaveBeenNthCalledWith(1, 3, 1);
    expect(onFill).toHaveBeenNthCalledWith(2, 4, 1);
    detach();
  });

  it("drag does not repeat the same cell", () => {
    const { container, cell } = makeBoard();
    const onFill = vi.fn();
    const detach = attachPointer(container, { onFill, onCross: vi.fn() });

    cell.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, button: 0 }),
    );
    cell.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
    cell.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));

    expect(onFill).toHaveBeenCalledOnce(); // only the initial mousedown
    detach();
  });

  it("drag right-click calls onCross", () => {
    const { container } = makeBoard();
    const cell2 = document.createElement("div");
    cell2.className = "cell";
    cell2.dataset["x"] = "4";
    cell2.dataset["y"] = "1";
    container.appendChild(cell2);

    const onCross = vi.fn();
    const detach = attachPointer(container, { onFill: vi.fn(), onCross });

    container
      .querySelector<HTMLElement>('.cell[data-x="3"]')!
      .dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 2 }));
    cell2.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));

    expect(onCross).toHaveBeenCalledTimes(2);
    detach();
  });

  it("mousedown outside a cell does nothing", () => {
    const { container } = makeBoard();
    const onFill = vi.fn();
    const detach = attachPointer(container, { onFill, onCross: vi.fn() });
    container.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: false, button: 0 }),
    );
    expect(onFill).not.toHaveBeenCalled();
    detach();
  });

  it("detach removes all listeners", () => {
    const { container, cell } = makeBoard();
    const onFill = vi.fn();
    const detach = attachPointer(container, { onFill, onCross: vi.fn() });
    detach();
    cell.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, button: 0 }),
    );
    expect(onFill).not.toHaveBeenCalled();
  });
});
