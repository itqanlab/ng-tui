import type { ScreenBuffer } from '../renderer/screen-buffer.js';
import type { ComputedLayout } from '../layout/yoga-adapter.js';

export type BorderStyle = 'none' | 'single' | 'double' | 'rounded' | 'bold';

const BORDERS: Record<BorderStyle, { tl: string; tr: string; bl: string; br: string; h: string; v: string }> = {
  none: { tl: '', tr: '', bl: '', br: '', h: '', v: '' },
  single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  bold: { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
};

/**
 * Renders a <box> widget to the screen buffer.
 */
export function renderBox(
  buffer: ScreenBuffer,
  layout: ComputedLayout,
  props: {
    borderStyle?: BorderStyle;
    title?: string;
    titleRight?: string;
  },
): void {
  const { left, top, width, height } = layout;
  const style = props.borderStyle || 'none';

  if (style === 'none' || width < 2 || height < 2) return;

  const border = BORDERS[style];

  // Top border
  buffer.writeString(left, top, border.tl);
  for (let x = 1; x < width - 1; x++) {
    buffer.writeString(left + x, top, border.h);
  }
  buffer.writeString(left + width - 1, top, border.tr);

  // Title (left)
  if (props.title && width > 4) {
    const title = ` ${props.title} `;
    const maxLen = Math.min(title.length, width - 4);
    buffer.writeString(left + 2, top, title.slice(0, maxLen), { bold: true });
  }

  // Title (right)
  if (props.titleRight && width > 4) {
    const title = ` ${props.titleRight} `;
    const maxLen = Math.min(title.length, width - 4);
    const startX = left + width - 2 - maxLen;
    buffer.writeString(startX, top, title.slice(0, maxLen), { dim: true });
  }

  // Side borders
  for (let y = 1; y < height - 1; y++) {
    buffer.writeString(left, top + y, border.v);
    buffer.writeString(left + width - 1, top + y, border.v);
  }

  // Bottom border
  buffer.writeString(left, top + height - 1, border.bl);
  for (let x = 1; x < width - 1; x++) {
    buffer.writeString(left + x, top + height - 1, border.h);
  }
  buffer.writeString(left + width - 1, top + height - 1, border.br);
}
