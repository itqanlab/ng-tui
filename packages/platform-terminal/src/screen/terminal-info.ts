/**
 * Query terminal capabilities.
 */
export function getTerminalSize(): { columns: number; rows: number } {
  return {
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  };
}

export function supportsColor(): boolean {
  return process.stdout.isTTY === true;
}

export function supportsTrueColor(): boolean {
  const colorTerm = process.env.COLORTERM;
  return colorTerm === 'truecolor' || colorTerm === '24bit';
}
