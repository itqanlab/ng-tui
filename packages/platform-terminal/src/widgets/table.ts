import type { ScreenBuffer } from '../renderer/screen-buffer.js';
import type { ComputedLayout } from '../layout/yoga-adapter.js';

/**
 * Renders a <table> widget to the screen buffer.
 */
export function renderTable(
  buffer: ScreenBuffer,
  layout: ComputedLayout,
  props: {
    headers?: string[];
    rows?: string[][];
    columnWidths?: number[];
  },
): void {
  const { left, top, width } = layout;
  const headers = props.headers || [];
  const rows = props.rows || [];
  const colCount = headers.length || (rows[0]?.length ?? 0);

  if (colCount === 0) return;

  // Calculate column widths
  const colWidths = props.columnWidths || Array(colCount).fill(Math.floor(width / colCount));

  let y = top;

  // Render headers
  if (headers.length > 0) {
    let x = left;
    for (let c = 0; c < headers.length; c++) {
      const text = headers[c].slice(0, colWidths[c]);
      buffer.writeString(x, y, text, { bold: true });
      x += colWidths[c] + 1;
    }
    y++;
  }

  // Render rows
  for (const row of rows) {
    let x = left;
    for (let c = 0; c < row.length; c++) {
      const text = row[c].slice(0, colWidths[c] || 10);
      buffer.writeString(x, y, text);
      x += (colWidths[c] || 10) + 1;
    }
    y++;
  }
}
