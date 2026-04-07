/**
 * Cursor management utilities.
 */
export function hideCursor(): void {
  process.stdout.write('\x1b[?25l');
}

export function showCursor(): void {
  process.stdout.write('\x1b[?25h');
}

export function moveCursor(x: number, y: number): void {
  process.stdout.write(`\x1b[${y + 1};${x + 1}H`);
}

export function saveCursor(): void {
  process.stdout.write('\x1b7');
}

export function restoreCursor(): void {
  process.stdout.write('\x1b8');
}
