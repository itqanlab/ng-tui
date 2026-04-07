import type { ScreenBuffer } from '../renderer/screen-buffer.js';
import type { ComputedLayout } from '../layout/yoga-adapter.js';

/**
 * Renders a <select> widget to the screen buffer.
 */
export function renderSelect(
  buffer: ScreenBuffer,
  layout: ComputedLayout,
  props: {
    options?: string[];
    selectedIndex?: number;
  },
): void {
  const { left, top, width, height } = layout;
  const options = props.options || [];
  const selected = props.selectedIndex ?? 0;

  const visibleCount = Math.min(options.length, height);

  for (let i = 0; i < visibleCount; i++) {
    const isSelected = i === selected;
    const marker = isSelected ? '●' : '○';
    const text = `${marker} ${options[i]}`;
    const truncated = text.length > width ? text.slice(0, width) : text;

    buffer.writeString(left, top + i, truncated, isSelected ? { bold: true, fg: 'cyan' } : undefined);
  }
}
