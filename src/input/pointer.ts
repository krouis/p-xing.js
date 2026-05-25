export interface PointerOptions {
  onFill: (x: number, y: number) => void;
  onCross: (x: number, y: number) => void;
  onErase: (x: number, y: number) => void;
}

export function attachPointer(
  _element: HTMLElement,
  _options: PointerOptions,
): () => void {
  // Phase 4 implementation
  return () => undefined;
}
