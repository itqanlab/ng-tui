# Template Syntax

ng-tui uses Angular-style template syntax. Templates are parsed at compile time and evaluated at runtime against the component context.

## Interpolation

Use double curly braces to display component data:

```html
<text>Hello, {{ name }}!</text>
<text>Count: {{ count() }}</text>
<text>{{ firstName + ' ' + lastName }}</text>
```

Interpolation supports any valid expression, including:
- Property access: <code v-pre>{{ user.name }}</code>
- Method calls: <code v-pre>{{ getTitle() }}</code>
- Signal reads: <code v-pre>{{ count() }}</code>
- Arithmetic: <code v-pre>{{ price * quantity }}</code>
- Ternary: <code v-pre>{{ active ? 'Yes' : 'No' }}</code>

## Property Binding

Bind component data to element properties with `[property]`:

```html
<!-- String values need inner quotes -->
<box [borderStyle]="'rounded'">

<!-- Expressions -->
<text [style.bold]="isImportant">{{ message }}</text>
<text [style.color]="hasError ? 'red' : 'green'">{{ status }}</text>

<!-- Numeric values -->
<box [padding]="2" [flexGrow]="1">
```

### Style Bindings

Bind individual style properties with `[style.property]`:

```html
<text [style.bold]="true">Bold text</text>
<text [style.color]="'cyan'">Colored text</text>
<text [style.dim]="true">Dimmed text</text>
<text [style.underline]="true">Underlined</text>
```

### Layout Bindings

Bind Yoga flexbox layout properties:

```html
<box [flexDirection]="'column'"
     [flexGrow]="1"
     [width]="'100%'"
     [height]="20"
     [padding]="1"
     [padding.left]="2"
     [margin.top]="1"
     [gap]="1">
```

## Event Binding

Bind event handlers with `(event)`:

```html
<input (submit)="onSubmit($event)" />
<box (keypress)="onKey($event)">
```

The `$event` variable contains the event payload:

```typescript
@Component({
  selector: 'app-root',
  template: `
    <input (submit)="onSubmit($event)" [placeholder]="'Type here...'" />
  `
})
class AppComponent {
  onSubmit(text: string) {
    console.log('Submitted:', text);
  }
}
```

## Structural Directives

### *ngIf

Conditionally render elements:

```html
<text *ngIf="isLoggedIn">Welcome back!</text>
<text *ngIf="!isLoggedIn">Please log in.</text>

<!-- With signals -->
<spinner *ngIf="loading()">Loading...</spinner>
<box *ngIf="items().length > 0">
  <text>Found {{ items().length }} items</text>
</box>
```

### *ngFor

Iterate over arrays:

```html
<text *ngFor="let item of items">{{ item }}</text>

<!-- With index and signals -->
<box *ngFor="let msg of messages(); let i = index">
  <text>{{ i + 1 }}. {{ msg.text }}</text>
</box>
```

Available context variables:

| Variable | Type | Description |
|---|---|---|
| `index` | `number` | Current iteration index |
| `count` | `number` | Total number of items |
| `first` | `boolean` | True for the first item |
| `last` | `boolean` | True for the last item |
| `even` | `boolean` | True for even indices |
| `odd` | `boolean` | True for odd indices |

```html
<box *ngFor="let item of items(); let i = index; let isFirst = first; let isLast = last">
  <text [style.bold]="isFirst">{{ i }}: {{ item }}</text>
</box>
```

### *ngSwitch

Switch between multiple views:

```html
<box [ngSwitch]="status()">
  <text *ngSwitchCase="'loading'">Loading...</text>
  <text *ngSwitchCase="'error'" [style.color]="'red'">Error occurred</text>
  <text *ngSwitchCase="'success'" [style.color]="'green'">Done!</text>
  <text *ngSwitchDefault>Unknown status</text>
</box>
```

## Pipes

Transform displayed values with the pipe `|` syntax:

```html
<!-- Built-in pipes -->
<text>{{ name | uppercase }}</text>
<text>{{ name | lowercase }}</text>
<text>{{ title | titlecase }}</text>
<text>{{ data | json }}</text>
<text>{{ createdAt | date:'medium' }}</text>
<text>{{ longText | truncate:30 }}</text>
<text>{{ items | slice:0:5 }}</text>

<!-- Chaining pipes -->
<text>{{ name | uppercase | truncate:10 }}</text>
```

See [Directives & Pipes](/guide/directives-pipes) for details on all built-in pipes and directives.

## Compilation Pipeline

Templates go through the following steps:

```
Template string
  → Angular HTML parser AST
  → Directive desugaring (*ngFor → <ng-template>)
  → Binding extraction (interpolation, property, event)
  → Expression parsing (jsep)
  → CompiledTemplate (parse once, evaluate many)
```

Templates are compiled once and then evaluated many times against the component context during re-renders. This separation ensures efficient rendering — only bindings whose expressions have changed produce new output.
