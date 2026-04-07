import { type Cell, createEmptyCell, cellsEqual } from './cell.js';

/**
 * 2D grid of styled cells — the core rendering primitive.
 * Supports double-buffering for efficient differential updates.
 */
export class ScreenBuffer {
  private cells: Cell[][];
  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cells = this.createGrid(width, height);
  }

  get(x: number, y: number): Cell {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return createEmptyCell();
    }
    return this.cells[y][x];
  }

  set(x: number, y: number, cell: Cell): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.cells[y][x] = cell;
  }

  /** Write a string starting at (x, y) with optional style */
  writeString(x: number, y: number, text: string, style?: Partial<Cell>): void {
    for (let i = 0; i < text.length; i++) {
      if (x + i >= this.width) break;
      this.set(x + i, y, {
        char: text[i],
        ...style,
      });
    }
  }

  /** Clear the entire buffer */
  clear(): void {
    this.cells = this.createGrid(this.width, this.height);
  }

  /** Compute the diff between this buffer and another */
  diff(other: ScreenBuffer): CellChange[] {
    const changes: CellChange[] = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const current = this.get(x, y);
        const next = other.get(x, y);
        if (!cellsEqual(current, next)) {
          changes.push({ x, y, cell: next });
        }
      }
    }

    return changes;
  }

  /** Clone this buffer */
  clone(): ScreenBuffer {
    const buffer = new ScreenBuffer(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        buffer.set(x, y, { ...this.get(x, y) });
      }
    }
    return buffer;
  }

  private createGrid(width: number, height: number): Cell[][] {
    return Array.from({ length: height }, () =>
      Array.from({ length: width }, () => createEmptyCell()),
    );
  }
}

export interface CellChange {
  x: number;
  y: number;
  cell: Cell;
}
