/**
 * Represents a single property change.
 */
export interface SimpleChange {
  previousValue: any;
  currentValue: any;
  firstChange: boolean;
}

/**
 * A map of property names to their changes.
 * Passed to ngOnChanges().
 */
export type SimpleChanges = Record<string, SimpleChange>;
