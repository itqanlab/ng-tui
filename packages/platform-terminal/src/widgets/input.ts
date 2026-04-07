import type { ScreenBuffer } from '../renderer/screen-buffer.js';
import type { ComputedLayout } from '../layout/yoga-adapter.js';

/**
 * Renders an <input> widget to the screen buffer.
 */
export function renderInput(
  buffer: ScreenBuffer,
  layout: ComputedLayout,
  props: {
    value?: string;
    placeholder?: string;
    focus?: boolean;
    cursorPosition?: number;
  },
): void {
  const { left, top, width } = layout;
  const value = props.value || '';
  const placeholder = props.placeholder || '';
  const displayText = value || placeholder;
  const isPlaceholder = !value && placeholder;

  // Render prompt
  buffer.writeString(left, top, '> ', { bold: true });

  // Render text
  const textStart = left + 2;
  const maxLen = Math.min(displayText.length, width - 2);
  buffer.writeString(textStart, top, displayText.slice(0, maxLen), isPlaceholder ? { dim: true } : undefined);

  // Cursor indicator
  if (props.focus) {
    const cursorX = textStart + (props.cursorPosition ?? value.length);
    if (cursorX < left + width) {
      buffer.writeString(cursorX, top, '█');
    }
  }
}
