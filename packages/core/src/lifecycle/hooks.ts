import type { OnInit, OnDestroy, OnChanges, AfterViewInit } from './interfaces.js';
import type { SimpleChanges } from './changes.js';

/**
 * Runs lifecycle hooks on a component instance in the correct order.
 */
export function runOnInit(instance: any): void {
  if (typeof (instance as OnInit).ngOnInit === 'function') {
    (instance as OnInit).ngOnInit();
  }
}

export function runOnDestroy(instance: any): void {
  if (typeof (instance as OnDestroy).ngOnDestroy === 'function') {
    (instance as OnDestroy).ngOnDestroy();
  }
}

export function runOnChanges(instance: any, changes: SimpleChanges): void {
  if (typeof (instance as OnChanges).ngOnChanges === 'function') {
    (instance as OnChanges).ngOnChanges(changes);
  }
}

export function runAfterViewInit(instance: any): void {
  if (typeof (instance as AfterViewInit).ngAfterViewInit === 'function') {
    (instance as AfterViewInit).ngAfterViewInit();
  }
}
