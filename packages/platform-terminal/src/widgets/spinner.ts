import type { ScreenBuffer } from '../renderer/screen-buffer.js';
import type { ComputedLayout } from '../layout/yoga-adapter.js';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/**
 * Renders a <spinner> widget to the screen buffer.
 */
export function renderSpinner(
  buffer: ScreenBuffer,
  layout: ComputedLayout,
  props: {
    text?: string;
    frame?: number;
  },
): void {
  const { left, top } = layout;
  const frame = props.frame ?? 0;
  const spinnerChar = SPINNER_FRAMES[frame % SPINNER_FRAMES.length];
  const text = props.text || '';

  buffer.writeString(left, top, `${spinnerChar} ${text}`, { fg: 'cyan' });
}

export function getSpinnerFrameCount(): number {
  return SPINNER_FRAMES.length;
}
