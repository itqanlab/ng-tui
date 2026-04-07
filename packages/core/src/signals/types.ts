/**
 * A readable signal.
 */
export interface Signal<T> {
  (): T;
}

/**
 * A writable signal — can be set or updated.
 */
export interface WritableSignal<T> extends Signal<T> {
  set(value: T): void;
  update(fn: (current: T) => T): void;
}
