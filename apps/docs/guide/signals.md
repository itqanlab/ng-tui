# Signals & Reactivity

ng-tui uses a signal-based reactivity system for state management. Signals provide synchronous, fine-grained reactivity that automatically triggers re-renders when values change.

## signal()

Create a writable signal with an initial value:

```typescript
import { signal } from '@ng-tui/core';

const count = signal(0);

// Read
count();        // 0

// Write
count.set(5);   // sets to 5

// Update based on current value
count.update(n => n + 1);  // now 6
```

### In Components

Signals are the primary way to manage component state:

```typescript
import { Component, signal } from '@ng-tui/core';

@Component({
  selector: 'app-counter',
  template: `
    <box [flexDirection]="'column'" [borderStyle]="'rounded'" [padding]="1">
      <text [style.bold]="true">Count: {{ count() }}</text>
      <text [style.color]="'gray'">Press up/down to change</text>
    </box>
  `
})
class CounterComponent {
  count = signal(0);

  increment() {
    this.count.update(n => n + 1);
  }

  decrement() {
    this.count.update(n => n - 1);
  }
}
```

### Change Detection

Signals use `Object.is()` for equality. Setting a signal to the same value does **not** trigger a re-render:

```typescript
const name = signal('Alice');
name.set('Alice'); // No change, no re-render
name.set('Bob');   // Changed, triggers re-render
```

## computed()

Create a derived signal that automatically tracks dependencies and re-evaluates when they change:

```typescript
import { signal, computed } from '@ng-tui/core';

const price = signal(100);
const quantity = signal(3);
const total = computed(() => price() * quantity());

total(); // 300

quantity.set(5);
total(); // 500 — auto-updated
```

Computed signals are:
- **Lazy** — only evaluated when read
- **Cached** — re-evaluated only when dependencies change
- **Auto-tracked** — dependencies are detected automatically by reading signals inside the computation

### Composing Computed Signals

Computed signals can depend on other computed signals:

```typescript
const items = signal([
  { name: 'Widget', price: 25, qty: 2 },
  { name: 'Gadget', price: 50, qty: 1 },
]);

const subtotal = computed(() =>
  items().reduce((sum, item) => sum + item.price * item.qty, 0)
);

const tax = computed(() => subtotal() * 0.1);
const total = computed(() => subtotal() + tax());
```

## effect()

Run side effects whenever tracked signals change:

```typescript
import { signal, effect } from '@ng-tui/core';

const status = signal('idle');

const cleanup = effect(() => {
  console.log('Status changed to:', status());
});

status.set('loading'); // logs: "Status changed to: loading"
status.set('done');    // logs: "Status changed to: done"

// Stop the effect
cleanup();
```

### Key Behaviors

- Effects run **immediately** on creation (to establish dependency tracking)
- Effects **auto-track** — any signal read inside the effect function becomes a dependency
- The returned function **stops** the effect and removes all subscriptions

### Common Use Cases

```typescript
// Log state changes
effect(() => {
  console.log(`Messages: ${messages().length}, Loading: ${loading()}`);
});

// Sync to external system
effect(() => {
  externalApi.updateCount(count());
});
```

## Signals in Templates

Signals are called with `()` in template expressions:

```html
<!-- Reading a signal -->
<text>{{ count() }}</text>

<!-- In property bindings -->
<text [style.color]="isError() ? 'red' : 'green'">{{ message() }}</text>

<!-- With computed -->
<text>Total: {{ total() }}</text>

<!-- In structural directives -->
<box *ngIf="items().length > 0">
  <text *ngFor="let item of items()">{{ item.name }}</text>
</box>
```

## Types

```typescript
// Read-only signal
interface Signal<T> {
  (): T;
}

// Writable signal
interface WritableSignal<T> extends Signal<T> {
  set(value: T): void;
  update(fn: (current: T) => T): void;
}
```

## Signals vs RxJS

ng-tui supports both signals and RxJS. Use each where it fits:

| | Signals | RxJS |
|---|---|---|
| **Sync state** | `signal(0)`, `computed()` | — |
| **Async streams** | — | `Observable`, `Subject` |
| **Template binding** | <code v-pre>{{ count() }}</code> | Subscribe in `ngOnInit` |
| **Side effects** | `effect()` | `.subscribe()` |

Signals are ideal for UI state that changes synchronously. Use RxJS for async operations like API calls and streaming responses.
