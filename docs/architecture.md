# ng-tui: Workspace Architecture & File Structure

## Workspace Root

```
ng-tui/
├── .github/
│   └── workflows/
│       ├── ci.yml                       # Build + test + lint on PR
│       └── release.yml                  # nx release on tag/merge to main
├── packages/
│   ├── core/                            # @ng-tui/core
│   ├── common/                          # @ng-tui/common
│   ├── compiler/                        # @ng-tui/compiler
│   ├── platform-terminal/               # @ng-tui/platform-terminal
│   └── cli/                             # @ng-tui/cli
├── examples/
│   └── ai-chat/                         # Example: AI chat CLI
├── docs/
│   ├── idea.md
│   ├── research.md
│   ├── tech-stack.md
│   └── architecture.md
├── nx.json                              # Nx config: caching, task pipeline, release
├── pnpm-workspace.yaml                  # pnpm workspace definition
├── package.json                         # Root: scripts, devDependencies
├── tsconfig.base.json                   # Shared TS config (all packages extend)
├── biome.json                           # Biome lint + format config
├── vitest.workspace.ts                  # Vitest workspace config
├── .gitignore
├── .npmrc                               # pnpm settings
├── LICENSE
└── README.md
```

---

## Package: @ng-tui/core

The foundation. Decorators, DI, signals, lifecycle — no rendering, no templates. Everything else depends on this.

```
packages/core/
├── src/
│   ├── index.ts                         # Public API barrel export
│   │
│   ├── decorators/
│   │   ├── index.ts                     # Re-exports all decorators
│   │   ├── component.ts                 # @Component({ selector, template }) class decorator
│   │   ├── injectable.ts                # @Injectable() class decorator
│   │   ├── input.ts                     # @Input() property decorator
│   │   ├── output.ts                    # @Output() property decorator
│   │   └── pipe.ts                      # @Pipe({ name }) class decorator
│   │
│   ├── di/
│   │   ├── index.ts                     # Re-exports DI system
│   │   ├── injector.ts                  # Injector class — resolves dependencies
│   │   ├── injection-token.ts           # InjectionToken<T> — typed tokens for non-class deps
│   │   ├── provider.ts                  # Provider types: useClass, useValue, useFactory, useExisting
│   │   ├── metadata.ts                  # Internal helpers: getParamTypes(), getInjectableMetadata()
│   │   └── errors.ts                    # DI error types: NullInjectorError, CyclicDependencyError
│   │
│   ├── lifecycle/
│   │   ├── index.ts                     # Re-exports lifecycle interfaces
│   │   ├── interfaces.ts               # OnInit, OnDestroy, OnChanges, AfterViewInit interfaces
│   │   ├── hooks.ts                     # Lifecycle hook runner — calls hooks in correct order
│   │   └── changes.ts                   # SimpleChanges type (for OnChanges)
│   │
│   ├── signals/
│   │   ├── index.ts                     # Re-exports signal primitives
│   │   ├── signal.ts                    # signal<T>(initialValue) — writable signal
│   │   ├── computed.ts                  # computed(() => expr) — derived signal
│   │   ├── effect.ts                    # effect(() => { }) — side effect on signal change
│   │   └── types.ts                     # Signal<T>, WritableSignal<T>, ReadonlySignal<T>
│   │
│   ├── application/
│   │   ├── index.ts                     # Re-exports bootstrap
│   │   ├── bootstrap.ts                 # bootstrapApplication(RootComponent, config) — entry point
│   │   ├── application-ref.ts           # ApplicationRef — root app handle (tick, destroy)
│   │   └── application-config.ts        # ApplicationConfig type — providers, platform settings
│   │
│   └── types/
│       ├── index.ts                     # Re-exports shared types
│       ├── component-def.ts             # ComponentDef — parsed @Component metadata
│       ├── type.ts                      # Type<T> — constructor type helper
│       └── event-emitter.ts             # EventEmitter<T> — for @Output()
│
├── package.json
├── tsconfig.json                        # Extends tsconfig.base.json
├── tsconfig.spec.json                   # Test-specific TS config
├── vitest.config.ts
├── project.json                         # Nx project config (targets: build, test, lint)
└── README.md
```

### Public API (`@ng-tui/core`)

```typescript
// What users import
import {
  // Decorators
  Component, Injectable, Input, Output, Pipe,
  // DI
  Injector, InjectionToken, Inject,
  // Lifecycle
  OnInit, OnDestroy, OnChanges, AfterViewInit, SimpleChanges,
  // Signals
  signal, computed, effect, Signal, WritableSignal,
  // Application
  bootstrapApplication, ApplicationRef, ApplicationConfig,
  // Types
  EventEmitter, Type,
} from '@ng-tui/core';
```

---

## Package: @ng-tui/compiler

Turns templates into executable render instructions. Parses Angular-like syntax, evaluates expressions, desugars structural directives.

```
packages/compiler/
├── src/
│   ├── index.ts                         # Public API barrel export
│   │
│   ├── parser/
│   │   ├── index.ts
│   │   ├── template-parser.ts           # TemplateParser interface (abstraction layer)
│   │   ├── angular-parser-adapter.ts    # angular-html-parser implementation of TemplateParser
│   │   └── ast.ts                       # Template AST node types: TElement, TText, TBoundText, TTemplate
│   │
│   ├── expression/
│   │   ├── index.ts
│   │   ├── expression-parser.ts         # Parses binding expressions: "msg.text | uppercase"
│   │   ├── expression-evaluator.ts      # Evaluates parsed expressions against component context
│   │   ├── pipe-registry.ts             # Resolves pipe names to pipe instances
│   │   └── ast.ts                       # Expression AST: MemberAccess, MethodCall, PipeExpression, Literal
│   │
│   ├── directives/
│   │   ├── index.ts
│   │   ├── microsyntax-parser.ts        # Parses *ngFor="let item of items; let i = index"
│   │   ├── ng-for-compiler.ts           # Desugars *ngFor into template instantiation
│   │   ├── ng-if-compiler.ts            # Desugars *ngIf into conditional rendering
│   │   └── ng-switch-compiler.ts        # Desugars *ngSwitch
│   │
│   ├── bindings/
│   │   ├── index.ts
│   │   ├── interpolation.ts             # {{ expression }} — text interpolation binding
│   │   ├── property-binding.ts          # [prop]="expression" — property binding
│   │   ├── event-binding.ts             # (event)="handler($event)" — event binding
│   │   └── two-way-binding.ts           # [(prop)]="value" — two-way binding (sugar for [prop] + (propChange))
│   │
│   └── compilation/
│       ├── index.ts
│       ├── template-compiler.ts         # Main orchestrator: template string → compiled template
│       ├── compiled-template.ts         # CompiledTemplate — the output: a tree of render instructions
│       └── view-factory.ts              # Creates/destroys component views from compiled templates
│
├── package.json
├── tsconfig.json
├── tsconfig.spec.json
├── vitest.config.ts
├── project.json
└── README.md
```

### Compilation Pipeline

```
Template string ("@Component({ template: `...` })")
    │
    ▼
┌─────────────────────────────────┐
│  TemplateParser                 │  angular-html-parser (behind abstraction)
│  Parse HTML + Angular syntax    │
│  Output: Raw AST                │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Directive Compiler             │  Desugar *ngFor, *ngIf, *ngSwitch
│  Microsyntax → canonical form   │  into TTemplate nodes
│  Output: Desugared AST          │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Binding Compiler               │  Parse {{ expr }}, [prop], (event)
│  Extract expressions            │  into typed binding objects
│  Output: Bound AST              │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Expression Parser              │  Parse "msg.text | uppercase"
│  jsep + pipe extension          │  into expression AST
│  Output: Expression AST         │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  CompiledTemplate               │  Ready-to-execute template
│  Contains: element tree +       │  Only expressions re-evaluated
│  bound expressions + directives │  on state changes (parse once)
└─────────────────────────────────┘
```

---

## Package: @ng-tui/platform-terminal

The rendering backend. Takes compiled templates and draws them to the terminal.

```
packages/platform-terminal/
├── src/
│   ├── index.ts                         # Public API barrel export
│   │
│   ├── renderer/
│   │   ├── index.ts
│   │   ├── terminal-renderer.ts         # Main renderer — orchestrates layout → buffer → output
│   │   ├── screen-buffer.ts             # ScreenBuffer — 2D grid of styled cells
│   │   ├── cell.ts                      # Cell type: { char, fg, bg, bold, italic, ... }
│   │   ├── diff.ts                      # Diff two ScreenBuffers → minimal ANSI update commands
│   │   ├── ansi-writer.ts              # Writes ANSI escape sequences to stdout
│   │   └── sync-output.ts              # Synchronized output wrapper (\x1b[?2026h / l)
│   │
│   ├── layout/
│   │   ├── index.ts
│   │   ├── yoga-adapter.ts             # Wraps yoga-layout — create nodes, compute layout, read positions
│   │   ├── layout-props.ts             # FlexDirection, JustifyContent, AlignItems, etc. mapped types
│   │   └── layout-tree.ts              # Converts component tree → Yoga node tree → computed positions
│   │
│   ├── widgets/
│   │   ├── index.ts                     # Re-exports all widgets
│   │   ├── box.ts                       # <box> — container with borders, padding, flex layout
│   │   ├── text.ts                      # <text> — styled text output
│   │   ├── input.ts                     # <input> — text input with cursor
│   │   ├── list.ts                      # <list> — scrollable list with keyboard navigation
│   │   ├── spinner.ts                   # <spinner> — animated loading indicator
│   │   ├── progress.ts                  # <progress> — progress bar
│   │   ├── table.ts                     # <table> — column-aligned data table
│   │   ├── select.ts                    # <select> — selection menu with up/down
│   │   └── widget-registry.ts          # Maps element names to widget implementations
│   │
│   ├── events/
│   │   ├── index.ts
│   │   ├── keyboard.ts                  # Keyboard event listener — raw stdin → key events
│   │   ├── mouse.ts                     # Mouse event support (where terminal supports it)
│   │   ├── resize.ts                    # Terminal resize listener (SIGWINCH)
│   │   └── event-types.ts              # KeyEvent, MouseEvent, ResizeEvent types
│   │
│   ├── screen/
│   │   ├── index.ts
│   │   ├── screen.ts                    # Screen — manages terminal state, alternate buffer
│   │   ├── cursor.ts                    # Cursor visibility, position management
│   │   └── terminal-info.ts            # Query terminal: cols, rows, color support, capabilities
│   │
│   ├── styles/
│   │   ├── index.ts
│   │   ├── style-parser.ts             # Parses style attributes: [style.color]="'red'"
│   │   ├── colors.ts                    # Color system: named, hex, rgb, 256-color
│   │   └── borders.ts                   # Border styles: single, double, rounded, bold, none
│   │
│   └── platform/
│       ├── index.ts
│       ├── platform-terminal.ts         # PlatformTerminal — bootstraps the terminal environment
│       └── destroy.ts                   # Cleanup: restore cursor, exit alternate buffer, reset
│
├── package.json
├── tsconfig.json
├── tsconfig.spec.json
├── vitest.config.ts
├── project.json
└── README.md
```

### Rendering Pipeline (per frame)

```
Component state changes (signal/setter)
    │
    ▼
┌──────────────────────────────────┐
│  Change Detection                │  Detect which components have dirty bindings
│  (signal-based)                  │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Expression Evaluator            │  Re-evaluate only changed bindings
│  (from @ng-tui/compiler)        │  against component context
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Layout Engine                   │  yoga-layout: compute flexbox positions
│  (only if tree structure changed)│  for all visible widgets
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Widget Renderer                 │  Each widget writes styled cells
│  (box, text, input, etc.)       │  into the next ScreenBuffer
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Buffer Diff                     │  Compare next buffer vs current buffer
│  Cell-by-cell comparison         │  Collect minimal set of changes
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  ANSI Writer                     │  Emit cursor moves + style codes + chars
│  (synchronized output)           │  Flush to stdout in one batch
└──────────────────────────────────┘
```

---

## Package: @ng-tui/common

Built-in pipes and structural directives — the runtime implementations (not the compiler-side desugaring).

```
packages/common/
├── src/
│   ├── index.ts                         # Public API barrel export
│   │
│   ├── pipes/
│   │   ├── index.ts
│   │   ├── uppercase.pipe.ts            # UppercasePipe — {{ value | uppercase }}
│   │   ├── lowercase.pipe.ts            # LowercasePipe — {{ value | lowercase }}
│   │   ├── titlecase.pipe.ts            # TitleCasePipe — {{ value | titlecase }}
│   │   ├── date.pipe.ts                 # DatePipe — {{ value | date:'format' }}
│   │   ├── json.pipe.ts                 # JsonPipe — {{ value | json }}
│   │   ├── slice.pipe.ts               # SlicePipe — {{ array | slice:start:end }}
│   │   ├── truncate.pipe.ts            # TruncatePipe — {{ text | truncate:40 }}  (terminal-specific)
│   │   └── ansi.pipe.ts                # AnsiPipe — {{ text | ansi:'bold,red' }} (terminal-specific)
│   │
│   ├── directives/
│   │   ├── index.ts
│   │   ├── ng-for-of.ts                # NgForOf — runtime: iterates collection, manages views
│   │   ├── ng-if.ts                     # NgIf — runtime: creates/destroys view conditionally
│   │   ├── ng-switch.ts                # NgSwitch/NgSwitchCase/NgSwitchDefault — runtime
│   │   └── ng-style.ts                 # NgStyle — runtime: applies dynamic styles
│   │
│   └── services/
│       ├── index.ts
│       └── screen-navigator.ts          # ScreenNavigator — simple screen navigation (replaces Router)
│
├── package.json
├── tsconfig.json
├── tsconfig.spec.json
├── vitest.config.ts
├── project.json
└── README.md
```

---

## Package: @ng-tui/cli

Scaffolding tool. Users run `npx ng-tui new my-app` to create projects.

```
packages/cli/
├── src/
│   ├── index.ts                         # CLI entry point (#!/usr/bin/env node)
│   │
│   ├── commands/
│   │   ├── index.ts
│   │   ├── new.ts                       # ng-tui new <name> — scaffold new project
│   │   ├── generate.ts                  # ng-tui generate component <name>
│   │   ├── serve.ts                     # ng-tui serve — run in dev mode with watch
│   │   └── build.ts                     # ng-tui build — compile for distribution
│   │
│   ├── templates/
│   │   ├── project/                     # Template files for `ng-tui new`
│   │   │   ├── package.json.tmpl
│   │   │   ├── tsconfig.json.tmpl
│   │   │   ├── src/
│   │   │   │   ├── main.ts.tmpl
│   │   │   │   └── app.component.ts.tmpl
│   │   │   └── biome.json.tmpl
│   │   └── component/                   # Template for `ng-tui generate component`
│   │       ├── __name__.component.ts.tmpl
│   │       └── __name__.spec.ts.tmpl
│   │
│   └── utils/
│       ├── template-engine.ts           # Simple template file renderer (replace __name__, etc.)
│       └── prompts.ts                   # Interactive prompts for CLI commands
│
├── bin/
│   └── ng-tui.js                        # Executable entry: #!/usr/bin/env node
├── package.json
├── tsconfig.json
├── tsconfig.spec.json
├── vitest.config.ts
├── project.json
└── README.md
```

---

## Examples

```
examples/
└── ai-chat/
    ├── src/
    │   ├── main.ts                      # bootstrapApplication(AppComponent, { providers: [...] })
    │   ├── app.component.ts             # Root component — chat layout
    │   ├── chat/
    │   │   ├── chat.component.ts        # Chat messages display
    │   │   └── chat-input.component.ts  # User input with submit
    │   └── services/
    │       └── ai.service.ts            # AI model integration (Claude/OpenAI)
    ├── package.json
    └── tsconfig.json
```

### Example: app.component.ts

```typescript
import { Component, OnInit } from '@ng-tui/core';
import { AiService } from './services/ai.service';

@Component({
  selector: 'app-root',
  template: `
    <box [flexDirection]="'column'" [height]="'100%'">
      <box [flexGrow]="1" [borderStyle]="'rounded'" [title]="'AI Chat'">
        <text *ngFor="let msg of messages">{{ msg.role }}: {{ msg.text }}</text>
      </box>
      <box [height]="3" [borderStyle]="'single'">
        <input [placeholder]="'Type a message...'" (submit)="onSend($event)" />
      </box>
    </box>
  `
})
export class AppComponent implements OnInit {
  messages: { role: string; text: string }[] = [];

  constructor(private ai: AiService) {}

  ngOnInit() {
    this.ai.messages$.subscribe(msg => {
      this.messages = [...this.messages, msg];
    });
  }

  onSend(text: string) {
    this.messages = [...this.messages, { role: 'You', text }];
    this.ai.send(text);
  }
}
```

---

## Dependency Graph (Nx)

```
                    @ng-tui/core
                   ╱      |      ╲
                  ╱       |       ╲
    @ng-tui/common  @ng-tui/compiler  (both depend on core)
                  ╲       |
                   ╲      |
              @ng-tui/platform-terminal  (depends on core + compiler)
                      |
                      |
                 @ng-tui/cli  (depends on all — scaffolds projects using them)
```

### Build Order (Nx handles automatically)

```
1. @ng-tui/core               (no deps)
2. @ng-tui/common             (needs core)
   @ng-tui/compiler           (needs core)        ← parallel
3. @ng-tui/platform-terminal  (needs core + compiler)
4. @ng-tui/cli                (needs all)
```

---

## Key Design Principles

### 1. Parse Once, Evaluate Many
Templates are parsed into a `CompiledTemplate` when a component is first created. On subsequent renders, only expressions are re-evaluated — no re-parsing.

### 2. Abstraction Layers for Swappability
- `TemplateParser` interface wraps `angular-html-parser` — can swap later
- `yoga-adapter.ts` wraps `yoga-layout` — isolates WASM dependency
- `metadata.ts` wraps `reflect-metadata` — migration surface for TC39 decorators

### 3. Single Responsibility per Package
- **core** knows nothing about terminals or templates
- **compiler** knows nothing about terminals
- **platform-terminal** doesn't parse templates — receives compiled output
- **common** provides runtime implementations, not compilation logic

### 4. NestJS-style Bootstrap

```typescript
// main.ts — entry point for any ng-tui app
import { bootstrapApplication } from '@ng-tui/core';
import { provideTerminal } from '@ng-tui/platform-terminal';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideTerminal({ alternateBuffer: true }),
  ]
});
```
