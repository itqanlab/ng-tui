import type { MouseEvent } from './event-types.js';

type MouseListenerFn = (event: MouseEvent) => void;

/**
 * Mouse event support for terminals that support it.
 * Placeholder — will be implemented when needed.
 */
export class MouseListener {
  private listeners: MouseListenerFn[] = [];

  start(): void {
    // Enable mouse tracking: \x1b[?1000h
    process.stdout.write('\x1b[?1000h');
  }

  stop(): void {
    // Disable mouse tracking
    process.stdout.write('\x1b[?1000l');
  }

  onMouse(listener: MouseListenerFn): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}
