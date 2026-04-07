import type { ScreenBuffer, CellChange } from './screen-buffer.js';

/**
 * Compute minimal changes between two screen buffers.
 */
export function diffBuffers(current: ScreenBuffer, next: ScreenBuffer): CellChange[] {
  return current.diff(next);
}
