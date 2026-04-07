# Screen Navigation

ng-tui includes a built-in `ScreenNavigator` service for managing screen-based navigation in terminal apps. It uses a stack-based approach — similar to a mobile navigation stack.

## Setup

Import and inject `ScreenNavigator` from `@ng-tui/common`:

```typescript
import { Component, OnInit } from '@ng-tui/core';
import { ScreenNavigator, Route } from '@ng-tui/common';

@Component({
  selector: 'app-root',
  template: `<text>{{ currentScreen() }}</text>`
})
class AppComponent implements OnInit {
  constructor(private nav: ScreenNavigator) {}

  ngOnInit() {
    this.nav.registerRoutes([
      { name: 'home', component: HomeScreen },
      { name: 'detail', component: DetailScreen, params: ['id'] },
      { name: 'settings', component: SettingsScreen },
    ]);

    this.nav.navigate('home');
  }
}
```

## Defining Routes

Each route has a name, component, and optional parameters:

```typescript
import { Route } from '@ng-tui/common';

const routes: Route[] = [
  { name: 'home', component: HomeScreen },
  { name: 'detail', component: DetailScreen, params: ['id'] },
  { name: 'settings', component: SettingsScreen },
];
```

### Route Interface

```typescript
interface Route {
  name: string;           // Unique route identifier
  component: Type;        // Component class to render
  params?: string[];      // Named route parameters
  canActivate?: Type[];   // Guard classes (future)
}
```

## Navigating

```typescript
// Navigate to a route
this.nav.navigate('home');

// Navigate with parameters
this.nav.navigate('detail', { id: '42' });

// Go back
this.nav.back(); // returns false if already at root
```

## Reading Current Route

```typescript
// Get current activated route
const current = this.nav.current;
// { name: 'detail', params: { id: '42' } }

// Get current route definition
const route = this.nav.currentRoute;
// { name: 'detail', component: DetailScreen, params: ['id'] }
```

### ActivatedRoute Interface

```typescript
interface ActivatedRoute {
  name: string;
  params: Record<string, string>;
}
```

## Listening for Changes

Subscribe to navigation changes:

```typescript
const unsubscribe = this.nav.onChange((route) => {
  console.log('Navigated to:', route.name, route.params);
});

// Later: stop listening
unsubscribe();
```

## Full Example

```typescript
import { Component, OnInit, signal } from '@ng-tui/core';
import { ScreenNavigator } from '@ng-tui/common';

@Component({
  selector: 'app-root',
  template: `
    <box [flexDirection]="'column'" [height]="'100%'">
      <box [flexGrow]="1" [borderStyle]="'rounded'" [title]="screenTitle()">
        <text *ngIf="screen() === 'home'">Welcome! Press 1-3 to navigate.</text>
        <text *ngIf="screen() === 'settings'">Settings screen. Press b to go back.</text>
        <text *ngIf="screen() === 'profile'">Your profile. Press b to go back.</text>
      </box>
      <box [height]="1">
        <text [style.color]="'gray'">
          [1] Home  [2] Settings  [3] Profile  [b] Back
        </text>
      </box>
    </box>
  `
})
class AppComponent implements OnInit {
  screen = signal('home');
  screenTitle = signal('Home');

  constructor(private nav: ScreenNavigator) {}

  ngOnInit() {
    this.nav.registerRoutes([
      { name: 'home', component: AppComponent },
      { name: 'settings', component: AppComponent },
      { name: 'profile', component: AppComponent },
    ]);

    this.nav.onChange((route) => {
      this.screen.set(route.name);
      this.screenTitle.set(route.name.charAt(0).toUpperCase() + route.name.slice(1));
    });

    this.nav.navigate('home');
  }
}
```
