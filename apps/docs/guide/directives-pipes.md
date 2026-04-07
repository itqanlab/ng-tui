# Directives & Pipes

The `@ng-tui/common` package provides built-in directives and pipes for common template operations.

## Structural Directives

### NgForOf (*ngFor)

Renders a template for each item in a collection.

```html
<text *ngFor="let fruit of fruits()">{{ fruit }}</text>
```

**Microsyntax variables:**

```html
<box *ngFor="let item of items(); let i = index; let isFirst = first; let isLast = last; let isEven = even; let isOdd = odd">
  <text [style.bold]="isFirst" [style.dim]="isOdd">
    {{ i + 1 }}/{{ items().length }}: {{ item }}
  </text>
</box>
```

| Variable | Type | Description |
|---|---|---|
| `$implicit` | `T` | The current item |
| `index` | `number` | Zero-based loop index |
| `count` | `number` | Total items in collection |
| `first` | `boolean` | `true` for index 0 |
| `last` | `boolean` | `true` for the final item |
| `even` | `boolean` | `true` for even indices |
| `odd` | `boolean` | `true` for odd indices |

### NgIf (*ngIf)

Conditionally includes a template based on a truthy/falsy expression.

```html
<text *ngIf="isVisible">I'm visible</text>
<spinner *ngIf="loading()">Processing...</spinner>
<box *ngIf="results().length > 0">
  <text *ngFor="let r of results()">{{ r }}</text>
</box>
```

### NgSwitch

Switches between views based on a value.

```html
<box [ngSwitch]="view()">
  <box *ngSwitchCase="'list'">
    <text *ngFor="let item of items()">{{ item }}</text>
  </box>
  <box *ngSwitchCase="'detail'">
    <text>{{ selectedItem() }}</text>
  </box>
  <text *ngSwitchDefault>Select a view</text>
</box>
```

### NgStyle

Dynamically applies styles to an element.

```html
<text [ngStyle]="{ bold: true, color: 'cyan' }">Styled text</text>
```

## Pipes

Pipes transform values in template expressions using the `|` syntax. All built-in pipes implement the `PipeTransform` interface.

### uppercase

Transforms a string to uppercase.

```html
<text>{{ name | uppercase }}</text>
<!-- 'hello' → 'HELLO' -->
```

### lowercase

Transforms a string to lowercase.

```html
<text>{{ name | lowercase }}</text>
<!-- 'HELLO' → 'hello' -->
```

### titlecase

Transforms a string to title case (first letter of each word capitalized).

```html
<text>{{ name | titlecase }}</text>
<!-- 'hello world' → 'Hello World' -->
```

### date

Formats a `Date`, number (timestamp), or date string.

```html
<text>{{ createdAt | date }}</text>           <!-- short format (default) -->
<text>{{ createdAt | date:'medium' }}</text>  <!-- medium format -->
<text>{{ createdAt | date:'long' }}</text>    <!-- long format -->
<text>{{ createdAt | date:'time' }}</text>    <!-- time only -->
<text>{{ createdAt | date:'iso' }}</text>     <!-- ISO 8601 -->
```

| Format | Example Output |
|---|---|
| `'short'` | `4/7/26, 2:30 PM` |
| `'medium'` | `Apr 7, 2026, 2:30:00 PM` |
| `'long'` | `April 7, 2026 at 2:30:00 PM GMT+3` |
| `'time'` | `2:30:00 PM` |
| `'iso'` | `2026-04-07T11:30:00.000Z` |

### json

Serializes a value to formatted JSON.

```html
<text>{{ data | json }}</text>      <!-- default 2-space indent -->
<text>{{ data | json:4 }}</text>    <!-- 4-space indent -->
```

### slice

Extracts a portion of an array or string.

```html
<text *ngFor="let item of items() | slice:0:5">{{ item }}</text>
<!-- Shows first 5 items -->

<text>{{ longString | slice:0:100 }}</text>
<!-- First 100 characters -->
```

### truncate

Truncates a string to a maximum length with an ellipsis.

```html
<text>{{ description | truncate }}</text>          <!-- default: 40 chars -->
<text>{{ description | truncate:20 }}</text>        <!-- 20 chars -->
<text>{{ description | truncate:20:'…' }}</text>    <!-- custom suffix -->
```

### ansi

Processes ANSI styling for terminal text.

```html
<text>{{ text | ansi:'bold,red' }}</text>
```

## Custom Pipes

Create your own pipes with the `@Pipe` decorator:

```typescript
import { Pipe, PipeTransform } from '@ng-tui/core';

@Pipe({ name: 'reverse' })
class ReversePipe implements PipeTransform {
  transform(value: string): string {
    return value.split('').reverse().join('');
  }
}
```

Use in templates:

```html
<text>{{ name | reverse }}</text>
```

### Pipe with Arguments

```typescript
@Pipe({ name: 'repeat' })
class RepeatPipe implements PipeTransform {
  transform(value: string, times: number = 2): string {
    return value.repeat(times);
  }
}
```

```html
<text>{{ '=' | repeat:40 }}</text>
<!-- '========================================' -->
```

### Chaining Pipes

Pipes can be chained left-to-right:

```html
<text>{{ name | uppercase | truncate:10 }}</text>
```
