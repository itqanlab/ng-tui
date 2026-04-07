import type { Type } from '../types/type.js';
import { NullInjectorError, CyclicDependencyError } from './errors.js';
import { InjectionToken } from './injection-token.js';
import {
  type Provider,
  type Token,
  type ClassProvider,
  type ValueProvider,
  type FactoryProvider,
  type ExistingProvider,
  isProviderConfig,
} from './provider.js';
import { getParamTypes, getInjectTokens, getInjectableMetadata } from './metadata.js';

/**
 * Hierarchical dependency injection container.
 * Resolves dependencies by walking up the injector tree.
 */
export class Injector {
  private readonly instances = new Map<Token, any>();
  private readonly providers = new Map<Token, Provider>();
  private readonly resolving = new Set<Token>();

  constructor(
    providers: Provider[] = [],
    private readonly parent?: Injector,
  ) {
    // Register self
    this.instances.set(Injector, this);

    // Register providers
    for (const provider of providers) {
      if (isProviderConfig(provider)) {
        this.providers.set(provider.provide, provider);
      } else {
        // Bare class — treat as { provide: Class, useClass: Class }
        this.providers.set(provider, provider);
      }
    }
  }

  /**
   * Resolve a dependency by token.
   */
  resolve<T>(token: Token<T>): T {
    // Check cached instances first
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }

    // Check if we have a provider
    const provider = this.providers.get(token);
    if (provider) {
      return this.createInstance(token, provider);
    }

    // Try parent injector
    if (this.parent) {
      return this.parent.resolve(token);
    }

    // If token is a class, try to auto-resolve it
    if (typeof token === 'function') {
      return this.createInstance(token, token as Type);
    }

    throw new NullInjectorError(token);
  }

  /**
   * Create a child injector with additional providers.
   */
  createChild(providers: Provider[] = []): Injector {
    return new Injector(providers, this);
  }

  private createInstance<T>(token: Token<T>, provider: Provider): T {
    // Circular dependency detection
    if (this.resolving.has(token)) {
      throw new CyclicDependencyError(token);
    }

    this.resolving.add(token);

    try {
      let instance: T;

      if (isProviderConfig(provider)) {
        if ('useValue' in provider) {
          instance = (provider as ValueProvider<T>).useValue;
        } else if ('useFactory' in provider) {
          const factoryProvider = provider as FactoryProvider<T>;
          const deps = (factoryProvider.deps || []).map((dep) => this.resolve(dep));
          instance = factoryProvider.useFactory(...deps);
        } else if ('useExisting' in provider) {
          instance = this.resolve((provider as ExistingProvider<T>).useExisting);
        } else {
          instance = this.createFromClass((provider as ClassProvider<T>).useClass);
        }
      } else {
        // Bare class
        instance = this.createFromClass(provider as Type<T>);
      }

      // Cache the instance (singleton within this injector)
      this.instances.set(token, instance);
      return instance;
    } finally {
      this.resolving.delete(token);
    }
  }

  private createFromClass<T>(target: Type<T>): T {
    const paramTypes = getParamTypes(target);
    const injectTokens = getInjectTokens(target);

    // Determine the number of constructor parameters.
    // When emitDecoratorMetadata is unavailable (e.g. esbuild/tsx), paramTypes
    // may be empty even though @Inject tokens exist. Use the larger count.
    const paramCount = Math.max(paramTypes.length, target.length, injectTokens.size > 0 ? Math.max(...injectTokens.keys()) + 1 : 0);

    const deps = [];
    for (let index = 0; index < paramCount; index++) {
      // Use explicit @Inject token if available, otherwise use the reflected type
      const token = injectTokens.get(index) || paramTypes[index];
      if (!token) {
        throw new NullInjectorError(`parameter at index ${index} of ${target.name}`);
      }
      deps.push(this.resolve(token));
    }

    return new target(...deps);
  }
}
