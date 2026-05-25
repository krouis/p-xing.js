import { describe, it, expect, vi, afterEach } from "vitest";
import { attachLongPress } from "../../src/input/long-press";

function makeBoard(): { container: HTMLElement; cell: HTMLElement } {
  const container = document.createElement("div");
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.dataset["x"] = "1";
  cell.dataset["y"] = "2";
  container.appendChild(cell);
  document.body.appendChild(container);
  return { container, cell };
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

function touchDown(el: HTMLElement, cx = 0, cy = 0): void {
  el.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      pointerType: "touch",
      pointerId: 1,
      clientX: cx,
      clientY: cy,
    }),
  );
}

function touchMove(el: HTMLElement, cx: number, cy: number): void {
  el.dispatchEvent(
    new PointerEvent("pointermove", {
      bubbles: true,
      pointerType: "touch",
      pointerId: 1,
      clientX: cx,
      clientY: cy,
    }),
  );
}

function touchUp(el: HTMLElement, cx = 0, cy = 0): void {
  el.dispatchEvent(
    new PointerEvent("pointerup", {
      bubbles: true,
      pointerType: "touch",
      pointerId: 1,
      clientX: cx,
      clientY: cy,
    }),
  );
}

describe("attachLongPress", () => {
  it("calls onTap when released before threshold", () => {
    vi.useFakeTimers();
    const { container, cell } = makeBoard();
    const onTap = vi.fn();
    const onLongPress = vi.fn();
    attachLongPress(container, {
      thresholdMs: 500,
      moveTolerancePx: 10,
      onTap,
      onLongPress,
    });

    touchDown(cell);
    vi.advanceTimersByTime(200);
    touchUp(cell);

    expect(onTap).toHaveBeenCalledWith(1, 2);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("calls onLongPress after threshold elapses", () => {
    vi.useFakeTimers();
    const { container, cell } = makeBoard();
    const onTap = vi.fn();
    const onLongPress = vi.fn();
    attachLongPress(container, {
      thresholdMs: 500,
      moveTolerancePx: 10,
      onTap,
      onLongPress,
    });

    touchDown(cell);
    vi.advanceTimersByTime(501);

    expect(onLongPress).toHaveBeenCalledWith(1, 2);
    expect(onTap).not.toHaveBeenCalled();
  });

  it("does not call onTap after longPress fires", () => {
    vi.useFakeTimers();
    const { container, cell } = makeBoard();
    const onTap = vi.fn();
    const onLongPress = vi.fn();
    attachLongPress(container, {
      thresholdMs: 500,
      moveTolerancePx: 10,
      onTap,
      onLongPress,
    });

    touchDown(cell);
    vi.advanceTimersByTime(501);
    touchUp(cell);

    expect(onLongPress).toHaveBeenCalledOnce();
    expect(onTap).not.toHaveBeenCalled();
  });

  it("cancels when pointer moves beyond tolerance", () => {
    vi.useFakeTimers();
    const { container, cell } = makeBoard();
    const onTap = vi.fn();
    const onLongPress = vi.fn();
    attachLongPress(container, {
      thresholdMs: 500,
      moveTolerancePx: 10,
      onTap,
      onLongPress,
    });

    touchDown(cell, 0, 0);
    touchMove(cell, 20, 0); // 20px > tolerance
    vi.advanceTimersByTime(600);
    touchUp(cell);

    expect(onTap).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("does not cancel on move within tolerance", () => {
    vi.useFakeTimers();
    const { container, cell } = makeBoard();
    const onLongPress = vi.fn();
    attachLongPress(container, {
      thresholdMs: 500,
      moveTolerancePx: 10,
      onTap: vi.fn(),
      onLongPress,
    });

    touchDown(cell, 0, 0);
    touchMove(cell, 5, 5); // sqrt(50) ≈ 7 < tolerance
    vi.advanceTimersByTime(501);

    expect(onLongPress).toHaveBeenCalledOnce();
  });

  it("cancels on pointercancel", () => {
    vi.useFakeTimers();
    const { container, cell } = makeBoard();
    const onTap = vi.fn();
    const onLongPress = vi.fn();
    attachLongPress(container, {
      thresholdMs: 500,
      moveTolerancePx: 10,
      onTap,
      onLongPress,
    });

    touchDown(cell);
    cell.dispatchEvent(
      new PointerEvent("pointercancel", {
        bubbles: true,
        pointerType: "touch",
        pointerId: 1,
      }),
    );
    vi.advanceTimersByTime(600);

    expect(onTap).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("ignores non-touch pointer events", () => {
    vi.useFakeTimers();
    const { container, cell } = makeBoard();
    const onTap = vi.fn();
    const onLongPress = vi.fn();
    attachLongPress(container, {
      thresholdMs: 500,
      moveTolerancePx: 10,
      onTap,
      onLongPress,
    });

    cell.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        pointerType: "mouse",
        pointerId: 1,
      }),
    );
    vi.advanceTimersByTime(600);

    expect(onTap).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("returns a detach function that removes all listeners", () => {
    const { container, cell } = makeBoard();
    const onTap = vi.fn();
    const detach = attachLongPress(container, {
      thresholdMs: 500,
      moveTolerancePx: 10,
      onTap,
      onLongPress: vi.fn(),
    });

    detach();
    touchDown(cell);
    touchUp(cell);

    expect(onTap).not.toHaveBeenCalled();
  });

  it("ignores pointerdown on non-cell target", () => {
    vi.useFakeTimers();
    const { container } = makeBoard();
    const onTap = vi.fn();
    attachLongPress(container, {
      thresholdMs: 500,
      moveTolerancePx: 10,
      onTap,
      onLongPress: vi.fn(),
    });

    // Event on the container itself, not on a .cell
    container.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        pointerType: "touch",
        pointerId: 1,
      }),
    );
    vi.advanceTimersByTime(600);

    expect(onTap).not.toHaveBeenCalled();
  });
});
