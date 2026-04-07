import { Subject, type Subscription } from 'rxjs';

/**
 * EventEmitter for @Output() decorated properties.
 * Extends RxJS Subject to integrate with the reactive system.
 */
export class EventEmitter<T = void> extends Subject<T> {
  emit(value: T): void {
    this.next(value);
  }

  subscribe(observer?: any): Subscription {
    return super.subscribe(observer);
  }
}
