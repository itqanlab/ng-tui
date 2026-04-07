import type { ScreenBuffer } from '../renderer/screen-buffer.js';
import type { ComputedLayout } from '../layout/yoga-adapter.js';

/**
 * Renders a <progress> widget to the screen buffer.
 */
export function renderProgress(
  buffer: ScreenBuffer,
  layout: ComputedLayout,
  props: {
    value?: number; // 0-100
    showPercentage?: boolean;
  },
): void {
  const { left, top, width } = layout;
  const value = Math.min(100, Math.max(0, props.value ?? 0));
  const showPct = props.showPercentage !== false;

  const pctText = showPct ? ` ${Math.round(value)}%` : '';
  const barWidth = width - pctText.length - 2; // 2 for [ ]

  if (barWidth < 1) return;

  const filledWidth = Math.round((value / 100) * barWidth);
  const bar = '█'.repeat(filledWidth) + '░'.repeat(barWidth - filledWidth);

  buffer.writeString(left, top, `[${bar}]${pctText}`, { fg: 'green' });
}
