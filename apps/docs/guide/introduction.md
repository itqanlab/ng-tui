# Introduction

## What is ng-tui?

ng-tui is a terminal UI framework that brings Angular's familiar developer experience to CLI tool development. Similar to how NestJS brought Angular's patterns to server-side Node.js, ng-tui brings them to the terminal.

It is **not** Angular itself — it's a new lightweight framework built from scratch for Node.js terminals using the same syntax, patterns, and mental model that Angular developers already know.

## The Problem

- **React Ink** exists for React developers to build terminal UIs using React syntax.
- **No equivalent exists for Angular developers.**
- Angular's rendering is tightly coupled to the browser DOM, making it impossible to retarget to a terminal.
- The trend of AI-powered CLI tools (Claude Code, OpenCode, Codex) is growing, and developers need good frameworks to build them.

## The Solution

ng-tui uses Angular's syntax — decorators, DI, template bindings, lifecycle hooks, signals — but renders to the terminal instead of the browser.

```typescript
@Component({
  selector: 'app-chat',
  template: `
    <box [title]="'Chat'" [borderStyle]="'rounded'">
      <text *ngFor="let msg of messages()">{{ msg }}</text>
      <input (submit)="onSubmit($event)" />
    </box>
  `
})
class ChatComponent {
  messages = signal<string[]>([]);

  onSubmit(text: string) {
    this.messages.update(msgs => [...msgs, text]);
  }
}
```

## Architecture

ng-tui is organized as a monorepo with five packages:

| Package | Purpose |
|---|---|
| `@ng-tui/core` | Decorators, DI, signals, lifecycle hooks |
| `@ng-tui/common` | Built-in pipes and directives (ngFor, ngIf, etc.) |
| `@ng-tui/compiler` | Template parser and expression evaluator |
| `@ng-tui/platform-terminal` | Terminal renderer, Yoga layout, widgets, input events |
| `@ng-tui/cli` | Scaffolding CLI (`ng-tui new`, `generate`, `serve`, `build`) |

**Key design boundaries:**

- `core` has zero knowledge of terminals or templates
- `compiler` has zero knowledge of terminals — outputs compiled templates consumed by platform-terminal
- `platform-terminal` never parses templates — only receives compiled output

## Compilation Pipeline

```
Template string
  -> Angular HTML parser AST
  -> Directive desugaring (*ngFor, *ngIf -> <ng-template>)
  -> Binding extraction (interpolation, property, event)
  -> Expression parsing (jsep)
  -> CompiledTemplate (parse once, evaluate many)
```

## Rendering Pipeline

```
Signal change
  -> Dirty binding detection
  -> Expression re-evaluation
  -> Yoga flexbox layout
  -> Widget cell rendering
  -> Buffer diff
  -> Minimal ANSI output
```

## Target Use Cases

1. AI-powered CLI tools (chat interfaces, coding assistants)
2. DevOps dashboards in the terminal
3. Interactive CLI wizards and forms
4. Real-time log viewers and monitors

## Inspiration

- **NestJS** — proved Angular-style syntax works outside Angular
- **React Ink** — proved terminal UI frameworks work
- **Angular** — syntax, patterns, developer experience
- **Claude Code, OpenCode** — the AI CLI tool trend driving demand
