import type { Cell } from './cell.js';
import type { CellChange } from './screen-buffer.js';

/**
 * Converts cell changes to ANSI escape sequences and writes to stdout.
 */
export class AnsiWriter {
  private stream: NodeJS.WriteStream;

  constructor(stream?: NodeJS.WriteStream) {
    this.stream = stream || process.stdout;
  }

  /** Move cursor to position (1-indexed for ANSI) */
  moveTo(x: number, y: number): string {
    return `\x1b[${y + 1};${x + 1}H`;
  }

  /** Apply style for a cell */
  styleCell(cell: Cell): string {
    const codes: number[] = [];

    if (cell.bold) codes.push(1);
    if (cell.dim) codes.push(2);
    if (cell.italic) codes.push(3);
    if (cell.underline) codes.push(4);
    if (cell.strikethrough) codes.push(9);

    if (cell.fg) {
      const fgCode = this.colorToAnsi(cell.fg, false);
      if (fgCode) codes.push(...fgCode);
    }

    if (cell.bg) {
      const bgCode = this.colorToAnsi(cell.bg, true);
      if (bgCode) codes.push(...bgCode);
    }

    if (codes.length === 0) return '\x1b[0m';
    return `\x1b[${codes.join(';')}m`;
  }

  /** Write a set of cell changes to the stream */
  writeChanges(changes: CellChange[]): void {
    if (changes.length === 0) return;

    let output = '';

    // Begin synchronized output
    output += '\x1b[?2026h';

    for (const change of changes) {
      output += this.moveTo(change.x, change.y);
      output += this.styleCell(change.cell);
      output += change.cell.char;
    }

    // Reset style
    output += '\x1b[0m';

    // End synchronized output
    output += '\x1b[?2026l';

    this.stream.write(output);
  }

  /** Clear the entire screen */
  clearScreen(): void {
    this.stream.write('\x1b[2J\x1b[H');
  }

  /** Hide cursor */
  hideCursor(): void {
    this.stream.write('\x1b[?25l');
  }

  /** Show cursor */
  showCursor(): void {
    this.stream.write('\x1b[?25h');
  }

  private colorToAnsi(color: string, isBackground: boolean): number[] | null {
    const offset = isBackground ? 10 : 0;

    const namedColors: Record<string, number> = {
      black: 30, red: 31, green: 32, yellow: 33,
      blue: 34, magenta: 35, cyan: 36, white: 37,
      gray: 90, grey: 90,
    };

    if (namedColors[color] !== undefined) {
      return [namedColors[color] + offset];
    }

    // Hex color → RGB → 24-bit ANSI
    if (color.startsWith('#') && color.length === 7) {
      const r = Number.parseInt(color.slice(1, 3), 16);
      const g = Number.parseInt(color.slice(3, 5), 16);
      const b = Number.parseInt(color.slice(5, 7), 16);
      return [isBackground ? 48 : 38, 2, r, g, b];
    }

    return null;
  }
}
