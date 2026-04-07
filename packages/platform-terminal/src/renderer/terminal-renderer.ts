import { ScreenBuffer } from './screen-buffer.js';
import { AnsiWriter } from './ansi-writer.js';
import { diffBuffers } from './diff.js';

/**
 * Main terminal renderer.
 * Orchestrates: layout → buffer → diff → ANSI output.
 */
export class TerminalRenderer {
  private currentBuffer: ScreenBuffer;
  private writer: AnsiWriter;

  constructor(width?: number, height?: number, stream?: NodeJS.WriteStream) {
    const cols = width || process.stdout.columns || 80;
    const rows = height || process.stdout.rows || 24;
    this.currentBuffer = new ScreenBuffer(cols, rows);
    this.writer = new AnsiWriter(stream);
  }

  /** Render a new frame by diffing against the current buffer */
  render(nextBuffer: ScreenBuffer): void {
    const changes = diffBuffers(this.currentBuffer, nextBuffer);
    this.writer.writeChanges(changes);
    this.currentBuffer = nextBuffer.clone();
  }

  /** Full screen redraw */
  fullRedraw(buffer: ScreenBuffer): void {
    this.writer.clearScreen();
    // Write every non-empty cell
    const changes = [];
    for (let y = 0; y < buffer.height; y++) {
      for (let x = 0; x < buffer.width; x++) {
        const cell = buffer.get(x, y);
        if (cell.char !== ' ' || cell.fg || cell.bg) {
          changes.push({ x, y, cell });
        }
      }
    }
    this.writer.writeChanges(changes);
    this.currentBuffer = buffer.clone();
  }

  /** Get current screen dimensions */
  getSize(): { width: number; height: number } {
    return {
      width: this.currentBuffer.width,
      height: this.currentBuffer.height,
    };
  }

  /** Clear screen and reset buffer */
  clear(): void {
    this.writer.clearScreen();
    this.currentBuffer.clear();
  }

  hideCursor(): void {
    this.writer.hideCursor();
  }

  showCursor(): void {
    this.writer.showCursor();
  }
}
