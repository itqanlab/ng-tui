import type { KeyEvent } from './event-types.js';

type KeyListener = (event: KeyEvent) => void;

/**
 * Listens to raw stdin for keyboard events.
 */
export class KeyboardListener {
  private listeners: KeyListener[] = [];
  private active = false;

  start(): void {
    if (this.active) return;
    this.active = true;

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', this.handleData);
  }

  stop(): void {
    this.active = false;
    process.stdin.removeListener('data', this.handleData);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
  }

  onKey(listener: KeyListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private handleData = (data: string): void => {
    const event = this.parseKey(data);
    for (const listener of this.listeners) {
      listener(event);
    }
  };

  private parseKey(raw: string): KeyEvent {
    const ctrl = raw.charCodeAt(0) < 27 && raw.length === 1;
    let key = raw;

    if (ctrl) {
      key = String.fromCharCode(raw.charCodeAt(0) + 96);
    }

    // Special keys
    switch (raw) {
      case '\r': key = 'return'; break;
      case '\n': key = 'return'; break;
      case '\t': key = 'tab'; break;
      case '\x7f': key = 'backspace'; break;
      case '\x1b': key = 'escape'; break;
      case '\x1b[A': key = 'up'; break;
      case '\x1b[B': key = 'down'; break;
      case '\x1b[C': key = 'right'; break;
      case '\x1b[D': key = 'left'; break;
    }

    return {
      key,
      ctrl,
      shift: false, // TODO: detect shift
      meta: raw.startsWith('\x1b') && raw.length > 1,
      raw,
    };
  }
}
