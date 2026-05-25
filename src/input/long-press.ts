export interface LongPressOptions {
  thresholdMs: number;
  moveTolerancePx: number;
  onTap: (x: number, y: number) => void;
  onLongPress: (x: number, y: number) => void;
}

export function attachLongPress(
  _element: HTMLElement,
  _options: LongPressOptions,
): () => void {
  // Phase 4 implementation
  return () => undefined;
}
