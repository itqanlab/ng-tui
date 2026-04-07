import type { ComputedLayout } from '../layout/yoga-adapter.js';
import type { ScreenBuffer } from '../renderer/screen-buffer.js';

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
    selectedStyle?: Partial<import('../renderer/cell.js').Cell>;
    itemStyle?: Partial<import('../renderer/cell.js').Cell>;
    prefix?: string;
    selectedPrefix?: string;
    activeMarker?: string;
    activeIndex?: number;
  },
): void {
  const { left, top, width, height } = layout;
  const items = props.items || [];
  const selected = props.selectedIndex ?? -1;
  const active = props.activeIndex ?? -1;
  const offset = props.scrollOffset ?? 0;
  const selPrefix = props.selectedPrefix ?? '> ';
  const normalPrefix = props.prefix ?? '  ';
  const activeMarker = props.activeMarker ?? '';

  const visibleCount = Math.min(items.length - offset, height);

  for (let i = 0; i < visibleCount; i++) {
    const itemIdx = offset + i;
    const isSelected = itemIdx === selected;
    const isActive = itemIdx === active;
    const prefix = isSelected ? selPrefix : normalPrefix;
    const marker = isActive ? activeMarker : '';
    const text = prefix + (marker ? marker + ' ' : '') + items[itemIdx];
    const truncated = text.length > width ? text.slice(0, width) : text;

    const style = isSelected
      ? (props.selectedStyle ?? { bold: true, fg: 'cyan' })
      : (props.itemStyle ?? undefined);

    // Fill background for selected items
    if (isSelected && style?.bg) {
      for (let x = 0; x < width; x++) {
        buffer.writeString(left + x, top + i, ' ', { bg: style.bg });
      }
    }

    buffer.writeString(left, top + i, truncated, style);
  }
}
