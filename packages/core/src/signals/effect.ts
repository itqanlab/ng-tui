import { _setActiveEffect, _getActiveEffect } from './signal.js';

/**
 * Runs a side effect whenever its tracked signals change.
 * Returns a cleanup function to stop the effect.
 *
 * @example
 * const name = signal('World');
 * const cleanup = effect(() => {
 *   console.log(`Hello, ${name()}!`);
 * });
 * name.set('ng-tui'); // logs: "Hello, ng-tui!"
 * cleanup(); // stops the effect
 */
export function effect(fn: () => void): () => void {
  let active = true;

  const run = () => {
    if (!active) return;

    const previousEffect = _getActiveEffect();
    _setActiveEffect(run);
    try {
      fn();
    } finally {
      _setActiveEffect(previousEffect);
    }
  };

  // Run immediately to establish subscriptions
  run();

  // Return cleanup function
  return () => {
    active = false;
  };
}
