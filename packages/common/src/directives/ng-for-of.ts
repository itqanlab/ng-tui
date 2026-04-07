/**
 * Runtime NgForOf directive.
 * Manages creating, updating, and destroying views for each item in a collection.
 */
export class NgForOf<T> {
  private items: T[] = [];
  private trackByFn?: (index: number, item: T) => any;

  setItems(items: T[]): void {
    this.items = items;
  }

  setTrackBy(fn: (index: number, item: T) => any): void {
    this.trackByFn = fn;
  }

  getItems(): T[] {
    return this.items;
  }

  getContext(item: T, index: number): NgForContext<T> {
    return {
      $implicit: item,
      index,
      count: this.items.length,
      first: index === 0,
      last: index === this.items.length - 1,
      even: index % 2 === 0,
      odd: index % 2 !== 0,
    };
  }

  trackBy(index: number, item: T): any {
    return this.trackByFn ? this.trackByFn(index, item) : item;
  }
}

export interface NgForContext<T> {
  $implicit: T;
  index: number;
  count: number;
  first: boolean;
  last: boolean;
  even: boolean;
  odd: boolean;
}
