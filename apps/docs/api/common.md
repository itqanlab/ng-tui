# @ng-tui/common

Built-in directives, pipes, and services for ng-tui applications. This package provides runtime implementations consumed by the template compiler and renderer.

## Directives

### NgForOf\<T\>

Runtime implementation of the `*ngFor` structural directive.

```typescript
class NgForOf<T> {
  setItems(items: T[]): void;
  setTrackBy(fn: (index: number, item: T) => any): void;
  getItems(): T[];
  getContext(item: T, index: number): NgForContext<T>;
  trackBy(index: number, item: T): any;
}
```

**NgForContext\<T\>:**

```typescript
interface NgForContext<T> {
  $implicit: T;   // The item itself
  index: number;  // Loop index
  count: number;  // Total items
  first: boolean; // Is first item
  last: boolean;  // Is last item
  even: boolean;  // Is even index
  odd: boolean;   // Is odd index
}
```

**Template usage:**

```html
<text *ngFor="let item of items(); let i = index; let isLast = last">
  {{ i + 1 }}. {{ item }}{{ isLast ? '' : ',' }}
</text>
```

### NgIf

Runtime implementation of the `*ngIf` structural directive.

```typescript
class NgIf {
  setCondition(value: any): boolean;
  shouldRender(): boolean;
}
```

**Template usage:**

```html
<text *ngIf="isVisible()">Visible content</text>
```

### NgSwitch

Runtime implementation of `[ngSwitch]`, `*ngSwitchCase`, and `*ngSwitchDefault`.

```typescript
class NgSwitch {
  setValue(value: any): void;
  matches(caseValue: any): boolean;
}
```

### NgStyle

Applies dynamic styles to elements.

```typescript
class NgStyle {
  setStyles(styles: Record<string, any>): void;
  getStyles(): Record<string, any>;
}
```

## Pipes

All pipes implement `PipeTransform` from `@ng-tui/core`.

### UppercasePipe

```typescript
@Pipe({ name: 'uppercase' })
class UppercasePipe implements PipeTransform {
  transform(value: string): string;
}
```

### LowercasePipe

```typescript
@Pipe({ name: 'lowercase' })
class LowercasePipe implements PipeTransform {
  transform(value: string): string;
}
```

### TitleCasePipe

```typescript
@Pipe({ name: 'titlecase' })
class TitleCasePipe implements PipeTransform {
  transform(value: string): string;
}
```

### DatePipe

```typescript
@Pipe({ name: 'date' })
class DatePipe implements PipeTransform {
  transform(value: Date | string | number, format?: 'short' | 'medium' | 'long' | 'time' | 'iso'): string;
}
```

### JsonPipe

```typescript
@Pipe({ name: 'json' })
class JsonPipe implements PipeTransform {
  transform(value: any, indent?: number): string;
}
```

### SlicePipe

```typescript
@Pipe({ name: 'slice' })
class SlicePipe implements PipeTransform {
  transform(value: any[] | string, start: number, end?: number): any[] | string;
}
```

### TruncatePipe

```typescript
@Pipe({ name: 'truncate' })
class TruncatePipe implements PipeTransform {
  transform(value: string, maxLength?: number, suffix?: string): string;
}
```

Default: 40 characters, `'...'` suffix.

### AnsiPipe

```typescript
@Pipe({ name: 'ansi' })
class AnsiPipe implements PipeTransform {
  transform(value: string, styles: string): { text: string; styles: string[] };
}
```

## Services

### ScreenNavigator

Stack-based screen/route navigator for terminal apps.

```typescript
@Injectable()
class ScreenNavigator {
  registerRoutes(routes: Route[]): void;
  navigate(name: string, params?: Record<string, string>): void;
  back(): boolean;

  get current(): ActivatedRoute | undefined;
  get currentRoute(): Route | undefined;

  onChange(listener: (route: ActivatedRoute) => void): () => void;
}
```

### Types

```typescript
interface Route {
  name: string;
  component: Type;
  params?: string[];
  canActivate?: Type[];
}

interface ActivatedRoute {
  name: string;
  params: Record<string, string>;
}
```

See [Navigation Guide](/guide/navigation) for usage examples.
