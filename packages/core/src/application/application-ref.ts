import type { Injector } from '../di/injector.js';
import { runOnDestroy, runOnInit } from '../lifecycle/hooks.js';
import type { Type } from '../types/type.js';

/**
 * Root application handle.
 * Manages the root component and injector.
 */
export class ApplicationRef {
  readonly injector: Injector;
  private rootInstance: any;
  private destroyed = false;
  private tickFn: (() => void) | null = null;

  constructor(
    private readonly rootComponent: Type,
    injector: Injector,
  ) {
    this.injector = injector;
    this.rootInstance = injector.resolve(rootComponent);
  }

  /** Get the root component instance */
  get root(): any {
    return this.rootInstance;
  }

  /** Initialize the application — calls ngOnInit on root */
  init(): void {
    runOnInit(this.rootInstance);
  }

  /** Register the platform's render callback */
  onTick(fn: () => void): void {
    this.tickFn = fn;
  }

  /** Trigger a change detection cycle (re-render) */
  tick(): void {
    if (this.tickFn) {
      this.tickFn();
    }
  }

  /** Destroy the application — calls ngOnDestroy on root */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    runOnDestroy(this.rootInstance);
  }

  get isDestroyed(): boolean {
    return this.destroyed;
  }
}
