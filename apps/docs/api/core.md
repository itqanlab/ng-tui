# @ng-tui/core

The foundation package providing decorators, dependency injection, signals, and lifecycle hooks. This package has zero knowledge of terminals or templates.

## Decorators

### @Component

Marks a class as a component with a selector and template.

```typescript
@Component({
  selector: 'app-root',
  template: `<box><text>Hello</text></box>`
})
class AppComponent {}
```

**Options:**
- `selector` — CSS-style selector for the component
- `template` — Inline template string

### @Injectable

Marks a class as available for dependency injection.

```typescript
@Injectable()
class MyService {
  getData() { return 'hello'; }
}
```

### @Input

Marks a property as an input binding.

```typescript
@Input() title = '';
@Input() count = 0;
```

### @Output

Marks a property as an output event emitter.

```typescript
@Output() submit = new EventEmitter<string>();
```

### @Pipe

Registers a class as a template pipe.

```typescript
@Pipe({ name: 'uppercase' })
class UppercasePipe {
  transform(value: string): string {
    return value.toUpperCase();
  }
}
```

## Dependency Injection

### Injector

The DI container that resolves and provides dependencies.

```typescript
const injector = Injector.create({
  providers: [
    MyService,
    { provide: API_URL, useValue: 'https://api.example.com' },
    { provide: Logger, useClass: ConsoleLogger },
    { provide: Config, useFactory: () => loadConfig() },
  ]
});

const service = injector.get(MyService);
```

### InjectionToken

Creates a unique token for non-class providers.

```typescript
const API_URL = new InjectionToken<string>('API_URL');
```

## Signals

### signal()

Creates a reactive signal with an initial value.

```typescript
const count = signal(0);
count();        // read: 0
count.set(5);   // write
count.update(n => n + 1); // update
```

### computed()

Creates a derived signal that auto-updates when dependencies change.

```typescript
const doubled = computed(() => count() * 2);
```

### effect()

Runs a side effect when signal dependencies change.

```typescript
effect(() => {
  console.log('Count changed:', count());
});
```

## Lifecycle Hooks

| Hook | Interface | When |
|---|---|---|
| `ngOnInit()` | `OnInit` | Component mounted |
| `ngOnDestroy()` | `OnDestroy` | Component removed |
| `ngOnChanges(changes)` | `OnChanges` | Input properties changed |
| `ngAfterViewInit()` | `AfterViewInit` | After child components initialized |

```typescript
class MyComponent implements OnInit, OnDestroy {
  ngOnInit() {
    // component is mounted
  }

  ngOnDestroy() {
    // cleanup subscriptions, timers, etc.
  }
}
```

## Application Bootstrap

### bootstrapApplication

Boots the root component with providers.

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideTerminal({ alternateBuffer: true }),
    MyService,
    { provide: CONFIG, useValue: myConfig },
  ]
});
```
