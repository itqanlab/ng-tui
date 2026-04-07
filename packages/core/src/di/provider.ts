import type { Type } from '../types/type.js';
import type { InjectionToken } from './injection-token.js';

/**
 * Token type — can be a class constructor or an InjectionToken.
 */
export type Token<T = any> = Type<T> | InjectionToken<T>;

/**
 * Provider using an existing class.
 */
export interface ClassProvider<T = any> {
  provide: Token<T>;
  useClass: Type<T>;
}

/**
 * Provider using a static value.
 */
export interface ValueProvider<T = any> {
  provide: Token<T>;
  useValue: T;
}

/**
 * Provider using a factory function.
 */
export interface FactoryProvider<T = any> {
  provide: Token<T>;
  useFactory: (...args: any[]) => T;
  deps?: Token[];
}

/**
 * Provider that aliases to another token.
 */
export interface ExistingProvider<T = any> {
  provide: Token<T>;
  useExisting: Token<T>;
}

/**
 * All provider types.
 */
export type Provider<T = any> =
  | Type<T>
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>
  | ExistingProvider<T>;

/**
 * Type guard: is this a provider config object (not a bare class)?
 */
export function isProviderConfig(provider: Provider): provider is ClassProvider | ValueProvider | FactoryProvider | ExistingProvider {
  return typeof provider === 'object' && 'provide' in provider;
}
