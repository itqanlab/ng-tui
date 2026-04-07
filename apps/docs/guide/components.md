# Components

Components are the building blocks of ng-tui applications. Each component encapsulates a template, logic, and optional providers.

## Defining a Component

Use the `@Component` decorator to define a component:

```typescript
import { Component } from '@ng-tui/core';

@Component({
  selector: 'app-greeting',
  template: `
    <box [borderStyle]="'rounded'" [padding]="1">
      <text [style.bold]="true">Hello, {{ name }}!</text>
    </box>
  `
})
class GreetingComponent {
  name = 'World';
}
```

## Component Options

| Option | Type | Description |
|---|---|---|
| `selector` | `string` | The custom element name used in templates |
| `template` | `string` | Inline template string |
| `providers` | `Provider[]` | Component-level dependency providers |
| `components` | `Type[]` | Child component classes used in the template |
| `styles` | `Record<string, string>` | Style definitions (reserved for future use) |

## Inputs

Use `@Input()` to accept data from parent components:

```typescript
import { Component, Input } from '@ng-tui/core';

@Component({
  selector: 'app-card',
  template: `
    <box [borderStyle]="'rounded'" [title]="title">
      <text>{{ description }}</text>
    </box>
  `
})
class CardComponent {
  @Input() title = '';
  @Input() description = '';
}
```

You can also provide an alias:

```typescript
@Input('cardTitle') title = '';
```

Then in the parent template:

```html
<app-card [cardTitle]="'My Card'" [description]="'Card content'"></app-card>
```

## Outputs

Use `@Output()` with `EventEmitter` to emit events to parent components:

```typescript
import { Component, Output, EventEmitter } from '@ng-tui/core';

@Component({
  selector: 'app-button',
  template: `
    <box [borderStyle]="'single'" [padding.left]="1" [padding.right]="1">
      <text>{{ label }}</text>
    </box>
  `
})
class ButtonComponent {
  @Input() label = 'Click';
  @Output() press = new EventEmitter<void>();
}
```

Listen to the event in a parent template:

```html
<app-button [label]="'Submit'" (press)="onSubmit()"></app-button>
```

## Child Components

Register child components in the `components` array:

```typescript
@Component({
  selector: 'app-root',
  components: [CardComponent, ButtonComponent],
  template: `
    <box [flexDirection]="'column'">
      <app-card [title]="'Welcome'" [description]="'Hello!'"></app-card>
      <app-button [label]="'Continue'" (press)="onContinue()"></app-button>
    </box>
  `
})
class AppComponent {
  onContinue() {
    // handle press
  }
}
```

## Component Providers

Components can define their own providers, scoped to that component's injector:

```typescript
@Component({
  selector: 'app-dashboard',
  providers: [DashboardService],
  template: `<text>{{ data }}</text>`
})
class DashboardComponent {
  constructor(private dashboard: DashboardService) {}
}
```

## Bootstrapping the Root Component

Every ng-tui app starts by bootstrapping a root component:

```typescript
import { bootstrapApplication } from '@ng-tui/core';
import { provideTerminal } from '@ng-tui/platform-terminal';

bootstrapApplication(AppComponent, {
  providers: [
    provideTerminal({ alternateBuffer: true }),
    MyService,
  ]
});
```

See also: [Dependency Injection](/guide/dependency-injection), [Templates](/guide/templates)
