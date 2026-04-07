import type { ResizeEvent } from './event-types.js';

type ResizeListenerFn = (event: ResizeEvent) => void;

/**
 * Listens for terminal resize events (SIGWINCH).
 */
export class ResizeListener {
  private listeners: ResizeListenerFn[] = [];
  private handler: (() => void) | null = null;

  start(): void {
    this.handler = () => {
      const event: ResizeEvent = {
        width: process.stdout.columns || 80,
        height: process.stdout.rows || 24,
      };
      for (const listener of this.listeners) {
        listener(event);
      }
    };
    process.stdout.on('resize', this.handler);
  }

  stop(): void {
    if (this.handler) {
      process.stdout.removeListener('resize', this.handler);
      this.handler = null;
    }
  }

  onResize(listener: ResizeListenerFn): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}
