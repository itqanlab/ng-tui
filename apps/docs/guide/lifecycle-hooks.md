# Lifecycle Hooks

ng-tui components have a lifecycle managed by the framework. You can tap into key moments of a component's life by implementing lifecycle hook interfaces.

## Available Hooks

| Hook | Interface | Called When |
|---|---|---|
| `ngOnInit()` | `OnInit` | Component is initialized (after constructor, before first render) |
| `ngOnChanges(changes)` | `OnChanges` | An `@Input()` property value changes |
| `ngAfterViewInit()` | `AfterViewInit` | After child components are initialized |
| `ngOnDestroy()` | `OnDestroy` | Component is being destroyed |

## OnInit

The most common hook. Use it for initialization logic that depends on injected services or input values:

```typescript
import { Component, OnInit, signal } from '@ng-tui/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <box [borderStyle]="'rounded'" [title]="'Dashboard'">
      <text *ngIf="loading()">Loading...</text>
      <text *ngFor="let item of data()">{{ item }}</text>
    </box>
  `
})
class DashboardComponent implements OnInit {
  loading = signal(true);
  data = signal<string[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.fetchData().then(result => {
      this.data.set(result);
      this.loading.set(false);
    });
  }
}
```

::: tip
Prefer `ngOnInit()` over the constructor for initialization logic. The constructor should only be used for simple property assignments and DI.
:::

## OnChanges

Called when any `@Input()` property changes. Receives a `SimpleChanges` object describing what changed:

```typescript
import { Component, Input, OnChanges, SimpleChanges } from '@ng-tui/core';

@Component({
  selector: 'app-user-card',
  template: `<text>{{ displayName }}</text>`
})
class UserCardComponent implements OnChanges {
  @Input() firstName = '';
  @Input() lastName = '';
  displayName = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['firstName'] || changes['lastName']) {
      this.displayName = `${this.firstName} ${this.lastName}`;
    }
  }
}
```

Each entry in `SimpleChanges` is a `SimpleChange` object:

```typescript
interface SimpleChange {
  previousValue: any;
  currentValue: any;
  firstChange: boolean;
}

type SimpleChanges = Record<string, SimpleChange>;
```

## AfterViewInit

Called after the component's child components have been initialized. Use this for logic that depends on child views being ready:

```typescript
import { Component, AfterViewInit } from '@ng-tui/core';

@Component({
  selector: 'app-root',
  components: [HeaderComponent, ContentComponent],
  template: `
    <box [flexDirection]="'column'">
      <app-header></app-header>
      <app-content></app-content>
    </box>
  `
})
class AppComponent implements AfterViewInit {
  ngAfterViewInit() {
    // All child components are now initialized
    console.log('View is ready');
  }
}
```

## OnDestroy

Called when the component is being removed. Use it to clean up subscriptions, timers, and other resources:

```typescript
import { Component, OnInit, OnDestroy } from '@ng-tui/core';

@Component({
  selector: 'app-clock',
  template: `<text>{{ time }}</text>`
})
class ClockComponent implements OnInit, OnDestroy {
  time = '';
  private interval?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.interval = setInterval(() => {
      this.time = new Date().toLocaleTimeString();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
```

## Execution Order

When a component is created and rendered, hooks execute in this order:

```
1. constructor()
2. ngOnChanges()    — if inputs are provided
3. ngOnInit()
4. ngAfterViewInit()
```

When inputs change:
```
1. ngOnChanges()
```

When a component is removed:
```
1. ngOnDestroy()
```

## Combining Hooks

A component can implement multiple lifecycle interfaces:

```typescript
@Component({
  selector: 'app-monitor',
  template: `<text>{{ status() }}</text>`
})
class MonitorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() target = '';
  status = signal('idle');
  private ws?: WebSocket;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['target'] && !changes['target'].firstChange) {
      this.reconnect();
    }
  }

  ngOnInit() {
    this.connect();
  }

  ngOnDestroy() {
    this.ws?.close();
  }

  private connect() {
    this.status.set('connecting');
    // ... connect logic
  }

  private reconnect() {
    this.ws?.close();
    this.connect();
  }
}
```
