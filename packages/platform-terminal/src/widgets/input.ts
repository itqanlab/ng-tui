import type { ComputedLayout } from '../layout/yoga-adapter.js';
import type { ScreenBuffer } from '../renderer/screen-buffer.js';

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
    prompt?: string;
    style?: Partial<import('../renderer/cell.js').Cell>;
    placeholderStyle?: Partial<import('../renderer/cell.js').Cell>;
  },
): void {
  const { left, top, width } = layout;
  const value = props.value || '';
  const placeholder = props.placeholder || '';
  const displayText = value || placeholder;
  const isPlaceholder = !value && placeholder;
  const prompt = props.prompt ?? '> ';
  const promptLen = prompt.length;

  // Fill background if style has bg
  if (props.style?.bg) {
    for (let x = 0; x < width; x++) {
      buffer.writeString(left + x, top, ' ', { bg: props.style.bg });
    }
  }

  // Render prompt
  if (prompt) {
    buffer.writeString(left, top, prompt, props.style ?? { bold: true });
  }

  // Render text
  const textStart = left + promptLen;
  const maxLen = Math.min(displayText.length, width - promptLen);
  const textStyle = isPlaceholder ? (props.placeholderStyle ?? { dim: true }) : props.style;
  buffer.writeString(textStart, top, displayText.slice(0, maxLen), textStyle);

  // Cursor indicator
  if (props.focus) {
    const cursorX = textStart + (props.cursorPosition ?? value.length);
    if (cursorX < left + width) {
      buffer.writeString(cursorX, top, '█', props.style);
    }
  }
}
