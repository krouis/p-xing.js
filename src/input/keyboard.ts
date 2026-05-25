export interface KeyboardOptions {
  onUndo: () => void;
  onRestart: () => void;
  onHelp: () => void;
}

export function attachKeyboard(_options: KeyboardOptions): () => void {
  // Phase 4 implementation
  return () => undefined;
}
