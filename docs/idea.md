# ng-tui: Angular-Syntax Terminal UI Framework

## Vision

A terminal UI framework that brings Angular's familiar developer experience to CLI tool development — similar to how NestJS brought Angular's patterns to server-side Node.js. Not Angular itself, but a new lightweight framework built from scratch for Node.js terminals using the same syntax, patterns, and mental model that Angular developers already know.

## Problem

- **React Ink** exists for React developers to build terminal UIs using React syntax.
- **No equivalent exists for Angular developers.**
- Angular's rendering is tightly coupled to the browser DOM, making it impossible to retarget to a terminal.
- The trend of AI-powered CLI tools (opencode, claude-code, etc.) is growing, and developers need good frameworks to build them.

## Core Idea

Build a framework that uses Angular's syntax (decorators, DI, template bindings, lifecycle hooks, RxJS) but renders to the terminal instead of the browser. Think of it as **"NestJS for terminal UIs"** — NestJS took Angular's patterns to the server, ng-tui takes them to the terminal. This is NOT a port of Angular — it's a new lightweight framework that speaks the same language.

## Key Features (Angular Syntax in the Terminal)

### Decorators

```typescript
@CliComponent({
  selector: 'app-chat',
  template: `
    <box [title]="title">
      <text *ngFor="let msg of messages">{{ msg }}</text>
      <input (submit)="onSubmit($event)" />
    </box>
  `
})
class ChatComponent implements OnInit { ... }
```

### Dependency Injection

```typescript
@Injectable()
class AiService {
  stream$ = new Subject<string>();
  constructor(private claude: ClaudeClient) {}
}
```

### Lifecycle Hooks

- `ngOnInit` — component mounted to terminal
- `ngOnDestroy` — component removed
- `ngOnChanges` — input properties changed

### Template Syntax

- `{{ expression }}` — text interpolation
- `[prop]="value"` — property binding
- `(event)="handler($event)"` — event binding (key events, submit, focus)
- `*ngFor` — repeat elements
- `*ngIf` — conditional rendering

### RxJS Integration

```typescript
messages$ = this.ai.stream$.pipe(
  scan((acc, msg) => [...acc, msg], [])
);
```

## Target Architecture

```
ng-tui/
├── packages/
│   ├── core/                → Decorators, DI, lifecycle, change detection
│   │   ├── decorators/      → @CliComponent, @Injectable, @Input, @Output
│   │   ├── di/              → Injector, providers, tokens
│   │   ├── lifecycle/       → Hook interfaces and execution
│   │   └── change-detection/→ Dirty checking / zone-less reactivity
│   ├── compiler/            → Template parser → terminal render tree
│   │   ├── parser/          → Angular template syntax → AST
│   │   ├── directives/      → *ngFor, *ngIf, *ngSwitch
│   │   └── bindings/        → Property, event, interpolation
│   ├── platform-terminal/   → Terminal rendering backend
│   │   ├── renderer/        → Writes to stdout (ink, blessed, or custom)
│   │   ├── widgets/         → <box>, <text>, <input>, <list>, <spinner>
│   │   └── events/          → Keyboard, mouse, resize
│   └── common/              → Shared utilities, pipes, built-in directives
├── cli/                     → `ng-tui new`, `ng-tui serve` scaffolding tool
├── docs/
└── examples/
    └── ai-chat/             → Example AI chat CLI built with ng-tui
```

## Target Use Cases

1. AI-powered CLI tools (chat interfaces, coding assistants)
2. DevOps dashboards in the terminal
3. Interactive CLI wizards and forms
4. Real-time log viewers and monitors

## Inspiration

- **NestJS** — proved Angular-style syntax works outside Angular (server-side)
- **React Ink** — proved terminal UI frameworks work
- **Angular** — syntax, patterns, developer experience
- **Blessed / Neo-Blessed** — terminal widget primitives
- **opencode, claude-code** — AI CLI tool trend

## Key Decisions

### Decorators: Legacy + reflect-metadata
- Using TypeScript legacy decorators (`experimentalDecorators: true`) + `reflect-metadata`
- Same approach as NestJS, Angular, TypeORM — battle-tested
- Enables auto-injection by type (`constructor(private ai: AiService)` just works)
- TC39 Stage 3 decorators lack parameter decorators and automatic type metadata — not viable for Angular-style DI
- **Migration safety net:** All metadata access is abstracted behind internal helpers, so switching to TC39 decorators in the future only requires changing those helpers

### Template Parser: angular-html-parser behind abstraction
- Using `angular-html-parser` (Prettier's standalone extraction) for HTML/Angular syntax parsing
- Wrapped behind a `TemplateParser` interface (like NestJS wraps Express behind `HttpAdapter`)
- If abandoned, we fork or replace — the abstraction isolates the dependency

### Naming: ng-tui
- "ng" = Angular community convention
- "tui" = Terminal User Interface
- No conflicts with existing packages or Angular CLI
