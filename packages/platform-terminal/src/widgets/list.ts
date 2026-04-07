import type { ScreenBuffer } from '../renderer/screen-buffer.js';
import type { ComputedLayout } from '../layout/yoga-adapter.js';

/**
 * Renders a <list> widget to the screen buffer.
 */
export function renderList(
  buffer: ScreenBuffer,
  layout: ComputedLayout,
  props: {
    items?: string[];
    selectedIndex?: number;
    scrollOffset?: number;
  },
): void {
  const { left, top, width, height } = layout;
  const items = props.items || [];
  const selected = props.selectedIndex ?? -1;
  const offset = props.scrollOffset ?? 0;

  const visibleCount = Math.min(items.length - offset, height);

  for (let i = 0; i < visibleCount; i++) {
    const itemIdx = offset + i;
    const isSelected = itemIdx === selected;
    const prefix = isSelected ? '> ' : '  ';
    const text = prefix + items[itemIdx];
    const truncated = text.length > width ? text.slice(0, width) : text;

    buffer.writeString(left, top + i, truncated, isSelected ? { bold: true, fg: 'cyan' } : undefined);
  }
}
