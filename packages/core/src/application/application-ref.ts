import { Injector } from '../di/injector.js';
import type { Type } from '../types/type.js';
import { runOnInit, runOnDestroy } from '../lifecycle/hooks.js';

/**
 * Root application handle.
 * Manages the root component and injector.
 */
export class ApplicationRef {
  readonly injector: Injector;
  private rootInstance: any;
  private destroyed = false;

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

  /** Trigger a change detection cycle (re-render) */
  tick(): void {
    // Will be connected to the renderer in platform-terminal
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
