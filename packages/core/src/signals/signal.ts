import type { WritableSignal } from './types.js';

type Subscriber = () => void;

/** Track the currently executing effect/computed for auto-subscription */
let activeEffect: Subscriber | null = null;

/** @internal */
export function _setActiveEffect(fn: Subscriber | null): void {
  activeEffect = fn;
}

/** @internal */
export function _getActiveEffect(): Subscriber | null {
  return activeEffect;
}

/**
 * Creates a writable signal with an initial value.
 * Calling the signal as a function reads its value.
 * Auto-tracks dependencies when read inside computed() or effect().
 *
 * @example
 * const count = signal(0);
 * count();        // read: 0
 * count.set(1);   // write
 * count.update(n => n + 1); // update based on current
 */
export function signal<T>(initialValue: T): WritableSignal<T> {
  let value = initialValue;
  const subscribers = new Set<Subscriber>();

  const read = () => {
    // Auto-track if inside an effect/computed
    if (activeEffect) {
      subscribers.add(activeEffect);
    }
    return value;
  };

  read.set = (newValue: T) => {
    if (!Object.is(value, newValue)) {
      value = newValue;
      notify(subscribers);
    }
  };

  read.update = (fn: (current: T) => T) => {
    read.set(fn(value));
  };

  return read as WritableSignal<T>;
}

function notify(subscribers: Set<Subscriber>): void {
  // Copy to avoid mutation during iteration
  for (const sub of [...subscribers]) {
    sub();
  }
}
