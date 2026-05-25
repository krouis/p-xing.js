import { describe, it, expect, vi, afterEach } from "vitest";
import { attachKeyboard } from "../../src/input/keyboard";

afterEach(() => {
  document.body.innerHTML = "";
});

function key(k: string, ctrlKey = false, metaKey = false): KeyboardEvent {
  return new KeyboardEvent("keydown", {
    bubbles: true,
    key: k,
    ctrlKey,
    metaKey,
  });
}

describe("attachKeyboard", () => {
  it("Ctrl+Z triggers onUndo", () => {
    const onUndo = vi.fn();
    const detach = attachKeyboard({
      onUndo,
      onRestart: vi.fn(),
      onHelpToggle: vi.fn(),
    });
    document.dispatchEvent(key("z", true));
    expect(onUndo).toHaveBeenCalledOnce();
    detach();
  });

  it("Meta+Z triggers onUndo", () => {
    const onUndo = vi.fn();
    const detach = attachKeyboard({
      onUndo,
      onRestart: vi.fn(),
      onHelpToggle: vi.fn(),
    });
    document.dispatchEvent(key("z", false, true));
    expect(onUndo).toHaveBeenCalledOnce();
    detach();
  });

  it("U triggers onUndo", () => {
    const onUndo = vi.fn();
    const detach = attachKeyboard({
      onUndo,
      onRestart: vi.fn(),
      onHelpToggle: vi.fn(),
    });
    document.dispatchEvent(key("u"));
    expect(onUndo).toHaveBeenCalledOnce();
    detach();
  });

  it("R triggers onRestart", () => {
    const onRestart = vi.fn();
    const detach = attachKeyboard({
      onUndo: vi.fn(),
      onRestart,
      onHelpToggle: vi.fn(),
    });
    document.dispatchEvent(key("r"));
    expect(onRestart).toHaveBeenCalledOnce();
    detach();
  });

  it("? triggers onHelpToggle", () => {
    const onHelpToggle = vi.fn();
    const detach = attachKeyboard({
      onUndo: vi.fn(),
      onRestart: vi.fn(),
      onHelpToggle,
    });
    document.dispatchEvent(key("?"));
    expect(onHelpToggle).toHaveBeenCalledOnce();
    detach();
  });

  it("uppercase U also triggers onUndo (case-insensitive)", () => {
    const onUndo = vi.fn();
    const detach = attachKeyboard({
      onUndo,
      onRestart: vi.fn(),
      onHelpToggle: vi.fn(),
    });
    document.dispatchEvent(key("U"));
    expect(onUndo).toHaveBeenCalledOnce();
    detach();
  });

  it("ignores keydown when target is an input element", () => {
    const onUndo = vi.fn();
    const detach = attachKeyboard({
      onUndo,
      onRestart: vi.fn(),
      onHelpToggle: vi.fn(),
    });
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "u" }),
    );
    expect(onUndo).not.toHaveBeenCalled();
    detach();
  });

  it("ignores keydown when target is a textarea", () => {
    const onRestart = vi.fn();
    const detach = attachKeyboard({
      onUndo: vi.fn(),
      onRestart,
      onHelpToggle: vi.fn(),
    });
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "r" }),
    );
    expect(onRestart).not.toHaveBeenCalled();
    detach();
  });

  it("detach removes the listener", () => {
    const onUndo = vi.fn();
    const detach = attachKeyboard({
      onUndo,
      onRestart: vi.fn(),
      onHelpToggle: vi.fn(),
    });
    detach();
    document.dispatchEvent(key("u"));
    expect(onUndo).not.toHaveBeenCalled();
  });

  it("unrelated keys do nothing", () => {
    const onUndo = vi.fn();
    const onRestart = vi.fn();
    const onHelpToggle = vi.fn();
    const detach = attachKeyboard({ onUndo, onRestart, onHelpToggle });
    document.dispatchEvent(key("a"));
    document.dispatchEvent(key("Enter"));
    expect(onUndo).not.toHaveBeenCalled();
    expect(onRestart).not.toHaveBeenCalled();
    expect(onHelpToggle).not.toHaveBeenCalled();
    detach();
  });
});
