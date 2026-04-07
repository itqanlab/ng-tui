import { showCursor } from '../screen/cursor.js';

/**
 * Emergency cleanup — restore terminal to a usable state.
 * Called on unhandled errors to prevent broken terminal.
 */
export function emergencyCleanup(): void {
  showCursor();
  // Exit alternate buffer
  process.stdout.write('\x1b[?1049l');
  // Disable mouse tracking
  process.stdout.write('\x1b[?1000l');
  // Reset styles
  process.stdout.write('\x1b[0m');
  // Clear screen
  process.stdout.write('\x1b[2J\x1b[H');
}

/**
 * Register emergency cleanup handlers.
 */
export function registerCleanupHandlers(): void {
  process.on('exit', emergencyCleanup);
  process.on('uncaughtException', (err) => {
    emergencyCleanup();
    console.error('Uncaught exception:', err);
    process.exit(1);
  });
  process.on('unhandledRejection', (err) => {
    emergencyCleanup();
    console.error('Unhandled rejection:', err);
    process.exit(1);
  });
}
