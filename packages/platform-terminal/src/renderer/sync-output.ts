/**
 * Synchronized output helpers.
 * Wraps output in synchronized update sequences to prevent flicker.
 * Supported by: iTerm2, WezTerm, kitty, Windows Terminal.
 */

export const SYNC_START = '\x1b[?2026h';
export const SYNC_END = '\x1b[?2026l';

export function wrapSynchronized(content: string): string {
  return SYNC_START + content + SYNC_END;
}
