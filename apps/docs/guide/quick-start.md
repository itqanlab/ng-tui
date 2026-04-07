# Quick Start

## Prerequisites

- Node.js >= 22
- pnpm (recommended) or npm

## Installation

```bash
# Install the core packages
pnpm add @ng-tui/core @ng-tui/common @ng-tui/platform-terminal
```

Or scaffold a new project with the CLI:

```bash
npx ng-tui new my-app
cd my-app
pnpm dev
```

## Hello World

Create a minimal ng-tui application:

```typescript
// main.ts
import { Component, bootstrapApplication } from '@ng-tui/core';
import { provideTerminal } from '@ng-tui/platform-terminal';

@Component({
  selector: 'app-root',
  template: `
    <box [borderStyle]="'rounded'" [padding]="1">
      <text [style.bold]="true" [style.color]="'green'">
        Hello from ng-tui!
      </text>
    </box>
  `
})
class AppComponent {}

bootstrapApplication(AppComponent, {
  providers: [provideTerminal({ alternateBuffer: true })],
});
```

Run it:

```bash
npx tsx main.ts
```

You should see a rounded box with bold green text in your terminal.

## Adding Interactivity

Let's add a counter with keyboard input:

```typescript
import { Component, signal, bootstrapApplication } from '@ng-tui/core';
import { provideTerminal } from '@ng-tui/platform-terminal';

@Component({
  selector: 'app-root',
  template: `
    <box [flexDirection]="'column'" [borderStyle]="'rounded'" [padding]="1">
      <text [style.bold]="true">Counter: {{ count() }}</text>
      <text [style.color]="'gray'">Press up/down to change, q to quit</text>
    </box>
  `
})
class CounterComponent {
  count = signal(0);
}

bootstrapApplication(CounterComponent, {
  providers: [provideTerminal({ alternateBuffer: true })],
});
```

## What's Next?

- Learn about [Components](/guide/introduction#architecture) and how they fit together
- Explore the [API Reference](/api/core) for `@ng-tui/core`
- Check out the [AI Chat Example](/examples/ai-chat) to see a full application
