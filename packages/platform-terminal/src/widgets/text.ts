import type { ScreenBuffer } from '../renderer/screen-buffer.js';
import type { ComputedLayout } from '../layout/yoga-adapter.js';
import type { Cell } from '../renderer/cell.js';

/**
 * Renders a <text> widget to the screen buffer.
 */
export function renderText(
  buffer: ScreenBuffer,
  layout: ComputedLayout,
  props: {
    content: string;
    style?: Partial<Cell>;
    textAlign?: 'left' | 'center' | 'right';
  },
): void {
  const { left, top, width } = layout;
  const text = props.content || '';
  const align = props.textAlign || 'left';

  // Split by lines
  const lines = text.split('\n');

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    if (top + lineIdx >= buffer.height) break;

    let line = lines[lineIdx];
    if (line.length > width) {
      line = line.slice(0, width);
    }

    let startX = left;
    if (align === 'center') {
      startX = left + Math.floor((width - line.length) / 2);
    } else if (align === 'right') {
      startX = left + width - line.length;
    }

    buffer.writeString(startX, top + lineIdx, line, props.style);
  }
}
