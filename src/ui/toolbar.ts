export interface ToolbarCallbacks {
  onUndo: () => void;
  onRestart: () => void;
  onThemeToggle: () => void;
}

export function initToolbar(
  container: HTMLElement,
  callbacks: ToolbarCallbacks,
): void {
  container
    .querySelector<HTMLButtonElement>("[data-action='undo']")
    ?.addEventListener("click", callbacks.onUndo);

  container
    .querySelector<HTMLButtonElement>("[data-action='restart']")
    ?.addEventListener("click", callbacks.onRestart);

  container
    .querySelector<HTMLButtonElement>("[data-action='theme']")
    ?.addEventListener("click", callbacks.onThemeToggle);
}
