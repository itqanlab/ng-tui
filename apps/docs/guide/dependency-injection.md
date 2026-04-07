# Dependency Injection

ng-tui includes a hierarchical dependency injection (DI) system inspired by Angular. Services are registered as providers and automatically injected into component constructors.

## Injectable Services

Mark a class as injectable with `@Injectable()`:

```typescript
import { Injectable } from '@ng-tui/core';

@Injectable()
class LoggerService {
  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
}
```

## Constructor Injection

Dependencies are resolved automatically via constructor parameters:

```typescript
import { Component } from '@ng-tui/core';

@Component({
  selector: 'app-root',
  template: `<text>{{ message }}</text>`
})
class AppComponent {
  message: string;

  constructor(private logger: LoggerService) {
    this.logger.log('AppComponent created');
    this.message = 'Hello!';
  }
}
```

## Provider Types

ng-tui supports four provider types:

### Class Provider

```typescript
// Shorthand — the class itself is both the token and the implementation
providers: [MyService]

// Explicit form
providers: [{ provide: MyService, useClass: MyService }]

// Swap implementation
providers: [{ provide: MyService, useClass: MockService }]
```

### Value Provider

```typescript
import { InjectionToken } from '@ng-tui/core';

const API_URL = new InjectionToken<string>('API_URL');

providers: [
  { provide: API_URL, useValue: 'https://api.example.com' }
]
```

### Factory Provider

```typescript
const CONFIG = new InjectionToken<Config>('CONFIG');

providers: [
  {
    provide: CONFIG,
    useFactory: (logger: LoggerService) => {
      logger.log('Creating config');
      return { debug: true };
    },
    deps: [LoggerService]
  }
]
```

### Existing Provider (Alias)

```typescript
providers: [
  ConsoleLogger,
  { provide: Logger, useExisting: ConsoleLogger }
]
```

## Injection Tokens

Use `InjectionToken` for non-class dependencies like strings, objects, or interfaces:

```typescript
import { InjectionToken } from '@ng-tui/core';

const APP_NAME = new InjectionToken<string>('APP_NAME');
const MAX_RETRIES = new InjectionToken<number>('MAX_RETRIES');

// Register
providers: [
  { provide: APP_NAME, useValue: 'My App' },
  { provide: MAX_RETRIES, useValue: 3 },
]
```

## Explicit Token with @Inject

When you need to inject a token that isn't a class constructor, use the `@Inject()` parameter decorator:

```typescript
import { Component, Inject } from '@ng-tui/core';

@Component({
  selector: 'app-root',
  template: `<text>{{ title }}</text>`
})
class AppComponent {
  constructor(@Inject(APP_NAME) public title: string) {}
}
```

## Hierarchical Injectors

Injectors form a tree. If a dependency isn't found in the current injector, it searches the parent:

```
Root Injector (bootstrapApplication providers)
  └── Component Injector (component providers)
       └── Child Component Injector
```

Component-level providers are scoped to that component:

```typescript
@Component({
  selector: 'app-panel',
  providers: [PanelService], // New instance per PanelComponent
  template: `<text>Panel</text>`
})
class PanelComponent {
  constructor(private panel: PanelService) {}
}
```

## The Injector API

You can also use the `Injector` directly:

```typescript
import { Injector } from '@ng-tui/core';

const injector = Injector.create({
  providers: [
    LoggerService,
    { provide: API_URL, useValue: 'https://api.example.com' },
  ]
});

const logger = injector.get(LoggerService);

// Create a child injector
const child = injector.createChild([
  { provide: API_URL, useValue: 'https://staging.example.com' },
]);
```

## Error Handling

ng-tui provides clear errors for DI issues:

- **NullInjectorError** — thrown when a dependency cannot be found in any injector in the chain
- **CyclicDependencyError** — thrown when circular dependencies are detected (e.g., A depends on B, B depends on A)

```typescript
import { NullInjectorError, CyclicDependencyError } from '@ng-tui/core';

try {
  injector.get(UnregisteredService);
} catch (e) {
  if (e instanceof NullInjectorError) {
    console.error('Service not provided:', e.message);
  }
}
```
