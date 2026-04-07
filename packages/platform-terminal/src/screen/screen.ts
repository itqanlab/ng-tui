import { hideCursor, showCursor } from './cursor.js';

/**
 * Manages terminal screen state (alternate buffer, cursor visibility).
 */
export class Screen {
  private alternateBuffer = false;

  enterAlternateBuffer(): void {
    process.stdout.write('\x1b[?1049h');
    this.alternateBuffer = true;
  }

  exitAlternateBuffer(): void {
    process.stdout.write('\x1b[?1049l');
    this.alternateBuffer = false;
  }

  clear(): void {
    process.stdout.write('\x1b[2J\x1b[H');
  }

  hideCursor(): void {
    hideCursor();
  }

  showCursor(): void {
    showCursor();
  }

  /** Clean up — restore terminal to original state */
  cleanup(): void {
    showCursor();
    if (this.alternateBuffer) {
      this.exitAlternateBuffer();
    }
  }
}
