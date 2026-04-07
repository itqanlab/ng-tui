/**
 * Thrown when a dependency cannot be resolved.
 */
export class NullInjectorError extends Error {
  constructor(token: any) {
    const name = typeof token === 'function' ? token.name : String(token);
    super(`NullInjectorError: No provider for ${name}`);
    this.name = 'NullInjectorError';
  }
}

/**
 * Thrown when circular dependencies are detected.
 */
export class CyclicDependencyError extends Error {
  constructor(token: any) {
    const name = typeof token === 'function' ? token.name : String(token);
    super(`CyclicDependencyError: Circular dependency detected for ${name}`);
    this.name = 'CyclicDependencyError';
  }
}
