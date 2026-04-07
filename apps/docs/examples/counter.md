# Counter Example

A simple counter app demonstrating signals, event binding, and reactive rendering.

## What it looks like

```
╭─ Counter ────────────────────────────╮
│                                      │
│  Count: 42                           │
│                                      │
│  ↑ increment   ↓ decrement   r reset │
│                                      │
╰──────────────────────────────────────╯
```

## Implementation

```typescript
import { Component, signal, computed, bootstrapApplication } from '@ng-tui/core';
import { provideTerminal } from '@ng-tui/platform-terminal';

@Component({
  selector: 'app-root',
  template: `
    <box [flexDirection]="'column'"
         [borderStyle]="'rounded'"
         [title]="'Counter'"
         [padding]="1"
         [width]="40">

      <text [style.bold]="true"
            [style.color]="countColor()">
        Count: {{ count() }}
      </text>

      <text></text>

      <text [style.color]="'gray'">
        ↑ increment   ↓ decrement   r reset
      </text>
    </box>
  `
})
class CounterComponent {
  count = signal(0);

  countColor = computed(() => {
    const n = this.count();
    if (n > 0) return 'green';
    if (n < 0) return 'red';
    return 'white';
  });

  increment() {
    this.count.update(n => n + 1);
  }

  decrement() {
    this.count.update(n => n - 1);
  }

  reset() {
    this.count.set(0);
  }
}

bootstrapApplication(CounterComponent, {
  providers: [provideTerminal({ alternateBuffer: true })],
});
```

## What this demonstrates

| Feature | Usage |
|---|---|
| `signal()` | Reactive counter state |
| `computed()` | Derived color based on count value |
| Interpolation | <code v-pre>{{ count() }}</code> displays the signal value |
| Property binding | `[style.color]="countColor()"` dynamic styling |
| Flexbox layout | Column direction, padding, fixed width |
| Box widget | Rounded border with title |
