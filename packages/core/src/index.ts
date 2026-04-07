// Ensure reflect-metadata is loaded
import 'reflect-metadata';

// Decorators
export { Component, Injectable, Inject, Input, Output, Pipe } from './decorators/index.js';

// Dependency Injection
export {
  Injector,
  InjectionToken,
  NullInjectorError,
  CyclicDependencyError,
} from './di/index.js';
export type {
  Provider,
  Token,
  ClassProvider,
  ValueProvider,
  FactoryProvider,
  ExistingProvider,
} from './di/index.js';

// Lifecycle
export type {
  OnInit,
  OnDestroy,
  OnChanges,
  AfterViewInit,
  PipeTransform,
  SimpleChange,
  SimpleChanges,
} from './lifecycle/index.js';
export { runOnInit, runOnDestroy, runOnChanges, runAfterViewInit } from './lifecycle/index.js';

// Signals
export { signal, computed, effect } from './signals/index.js';
export type { Signal, WritableSignal } from './signals/index.js';

// Application
export { bootstrapApplication, ApplicationRef } from './application/index.js';
export type { ApplicationConfig } from './application/index.js';

// Metadata (for platform integration)
export {
  getComponentMetadata,
  getInputMetadata,
  getOutputMetadata,
  getPipeMetadata,
} from './di/index.js';

// Types
export { EventEmitter } from './types/index.js';
export type { Type, ComponentDef } from './types/index.js';
