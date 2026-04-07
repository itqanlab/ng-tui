/**
 * Creates a unique token for non-class dependencies.
 * Used when you need to inject a value, config object, or interface.
 *
 * @example
 * const AI_PROVIDER = new InjectionToken<AiProvider>('AI_PROVIDER');
 */
export class InjectionToken<T = any> {
  private readonly _desc: string;

  constructor(description: string) {
    this._desc = description;
  }

  toString(): string {
    return `InjectionToken(${this._desc})`;
  }
}
