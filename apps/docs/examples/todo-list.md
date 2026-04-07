# Todo List Example

An interactive todo list demonstrating `*ngFor`, `*ngIf`, signals, input handling, and computed state.

## What it looks like

```
╭─ Todo List ──────────────────── 2/4 done ─╮
│                                            │
│  ✓ Buy groceries                           │
│  ✓ Write documentation                     │
│  ○ Review pull request                     │
│  ○ Deploy to staging                       │
│                                            │
├────────────────────────────────────────────┤
│ > Add a task...                            │
╰────────────────────────────────────────────╯
```

## Implementation

```typescript
import { Component, signal, computed, bootstrapApplication } from '@ng-tui/core';
import { provideTerminal } from '@ng-tui/platform-terminal';

interface Todo {
  text: string;
  done: boolean;
}

@Component({
  selector: 'app-root',
  template: `
    <box [flexDirection]="'column'"
         [borderStyle]="'rounded'"
         [title]="'Todo List'"
         [titleRight]="summary()"
         [width]="50">

      <!-- Empty state -->
      <box *ngIf="todos().length === 0" [padding]="1">
        <text [style.color]="'gray'" [style.dim]="true">
          No tasks yet. Add one below!
        </text>
      </box>

      <!-- Todo items -->
      <box [flexDirection]="'column'" [padding]="1">
        <text *ngFor="let todo of todos(); let i = index"
              [style.dim]="todo.done"
              [style.color]="todo.done ? 'gray' : 'white'">
          {{ todo.done ? '✓' : '○' }} {{ todo.text }}
        </text>
      </box>

      <!-- Input -->
      <box [height]="3" [borderStyle]="'single'">
        <input [placeholder]="'Add a task...'"
               (submit)="addTodo($event)"
               [focus]="true">
        </input>
      </box>
    </box>
  `
})
class TodoComponent {
  todos = signal<Todo[]>([
    { text: 'Buy groceries', done: true },
    { text: 'Write documentation', done: true },
    { text: 'Review pull request', done: false },
    { text: 'Deploy to staging', done: false },
  ]);

  doneCount = computed(() =>
    this.todos().filter(t => t.done).length
  );

  summary = computed(() =>
    `${this.doneCount()}/${this.todos().length} done`
  );

  addTodo(text: string) {
    if (!text.trim()) return;
    this.todos.update(list => [...list, { text, done: false }]);
  }

  toggleTodo(index: number) {
    this.todos.update(list =>
      list.map((todo, i) =>
        i === index ? { ...todo, done: !todo.done } : todo
      )
    );
  }

  removeTodo(index: number) {
    this.todos.update(list => list.filter((_, i) => i !== index));
  }
}

bootstrapApplication(TodoComponent, {
  providers: [provideTerminal({ alternateBuffer: true })],
});
```

## What this demonstrates

| Feature | Usage |
|---|---|
| `signal()` | Mutable todo list state |
| `computed()` | Derived done count and summary text |
| `*ngFor` | Iterates over todo items with index |
| `*ngIf` | Shows empty state when no todos |
| Input widget | Text input with submit handler |
| Property binding | Dynamic `[style.dim]`, `[style.color]` based on done state |
| Interpolation | Conditional icons <code v-pre>{{ todo.done ? '✓' : '○' }}</code> |
| Box title | `[title]` and `[titleRight]` for header info |
| Immutable updates | `signal.update()` with spread operator |
