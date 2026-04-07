import type { Signal } from './types.js';
import { _setActiveEffect, _getActiveEffect } from './signal.js';

/**
 * Creates a derived signal that auto-tracks dependencies.
 * Re-evaluates when any signal read inside the computation changes.
 *
 * @example
 * const count = signal(0);
 * const doubled = computed(() => count() * 2);
 * doubled(); // 0
 * count.set(5);
 * doubled(); // 10
 */
export function computed<T>(computation: () => T): Signal<T> {
  let cachedValue: T;
  let dirty = true;
  const subscribers = new Set<() => void>();

  const recompute = () => {
    dirty = true;
    // Notify our own subscribers
    for (const sub of [...subscribers]) {
      sub();
    }
  };

  const read = (): T => {
    // Track subscribers of this computed
    const currentEffect = _getActiveEffect();
    if (currentEffect) {
      subscribers.add(currentEffect);
    }

    if (dirty) {
      // Track which signals this computation reads
      const previousEffect = _getActiveEffect();
      _setActiveEffect(recompute);
      try {
        cachedValue = computation();
      } finally {
        _setActiveEffect(previousEffect);
      }
      dirty = false;
    }

    return cachedValue;
  };

  return read as Signal<T>;
}
