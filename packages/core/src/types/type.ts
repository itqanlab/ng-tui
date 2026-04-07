/**
 * Represents a constructor type.
 * Used throughout the DI system to reference injectable classes.
 */
export interface Type<T = any> {
  new (...args: any[]): T;
}
