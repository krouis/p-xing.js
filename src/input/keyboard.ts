export interface KeyboardOptions {
  onUndo: () => void;
  onRestart: () => void;
  onHelpToggle: () => void;
}

export function attachKeyboard(options: KeyboardOptions): () => void {
  function onKeyDown(e: KeyboardEvent) {
    const target = e.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      options.onUndo();
      return;
    }

    switch (e.key.toLowerCase()) {
      case "u":
        options.onUndo();
        break;
      case "r":
        options.onRestart();
        break;
      case "?":
        options.onHelpToggle();
        break;
    }
  }

  document.addEventListener("keydown", onKeyDown);
  return () => document.removeEventListener("keydown", onKeyDown);
}
