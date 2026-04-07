# ng-tui: Feasibility Research

## Executive Summary

**The idea is fully feasible.** No fundamental blockers exist. The space is genuinely open — no "Angular Ink" equivalent exists today. All building blocks are available as standalone libraries or proven patterns. The main engineering effort is integration and the template compiler.

---

## 1. Feasibility Assessment

### Is it possible to replicate Angular's syntax in a terminal framework?

| Feature | Feasibility | Approach |
|---|---|---|
| `@Component` / `@Injectable` decorators | **Easy** | TypeScript legacy decorators + reflect-metadata |
| Dependency Injection | **Easy** | Custom DI container (~300 lines) or adapt tsyringe |
| Template parsing (`{{ }}`, `[prop]`, `(event)`, `*ngFor`) | **Solved** | `angular-html-parser` (Prettier's standalone extraction) |
| Expression evaluation (`msg.text \| uppercase`) | **Moderate** | Small recursive-descent parser or `jsep` + pipe support |
| Structural directives (`*ngFor`, `*ngIf`) | **Moderate** | Custom desugaring + template instantiation |
| Lifecycle hooks (`ngOnInit`, `ngOnDestroy`) | **Easy** | Interface-based, called by framework at the right time |
| RxJS integration | **Easy** | RxJS is framework-agnostic, just import it |
| Flexbox layout in terminal | **Solved** | `yoga-layout` (standalone WASM, used by Ink & React Native) |
| Terminal rendering | **Moderate** | Custom double-buffer + ANSI diff renderer |
| Change detection | **Moderate** | Zone-less signals or dirty-checking |

**Verdict: All core Angular patterns can be replicated. Nothing requires inventing new technology.**

---

## 2. Challenges & Solutions

### Challenge 1: Template Compiler

**Problem:** Angular's template syntax (`{{ }}`, `[prop]`, `(event)`, `*ngFor`) needs to be parsed and evaluated. Angular's own compiler is 200KB+ and tightly coupled to the framework.

**Solution Options:**

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| A) `angular-html-parser` + custom expression parser | Lightweight, standalone, 154K weekly downloads, maintained by Prettier team | Doesn't parse expression values inside bindings | **Best option** |
| B) Extract from `@angular/compiler` | Full fidelity to Angular syntax | 200KB+, tightly coupled, overkill | Not recommended |
| C) Build parser from scratch | Full control, minimal dependencies | More initial work | Fallback option |

**Recommended pipeline:**
```
Template string
    → angular-html-parser → HTML AST (elements, attrs, {{ }})
    → Custom transformer → ng-tui AST (parsed bindings, desugared *ngFor)
    → Expression evaluator → Evaluated values against component context
    → Yoga layout → Terminal positions
    → ANSI renderer → stdout
```

**Expression parser approach:** Use `jsep` (JavaScript Expression Parser, ~5KB) and extend it to support Angular pipes (`value | pipeName:arg`). Angular expressions are a small subset of JS — member access, method calls, ternaries, pipes. No need for a full JS parser.

---

### Challenge 2: Terminal Rendering

**Problem:** Need to render a component tree to terminal output with layout, styling, and efficient updates (no flicker).

**Solution Options:**

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| A) React Ink | Proven, popular | Tightly coupled to React — cannot use without React | **Not viable** |
| B) Blessed / Neo-Blessed | Mature widget system, good diff rendering | Unmaintained since 2017, no TypeScript, no flexbox | Study, don't use |
| C) Yoga + custom ANSI renderer | Full control, no framework coupling, proven approach | More work upfront | **Best option** |
| D) OpenTUI (Zig core) | Native performance, supports non-React reconcilers | Pre-1.0, external dependency on Zig binary | Worth watching |
| E) terminal-kit | Good I/O primitives | No layout engine, imperative only | Partial use for I/O |

**Recommended architecture:**
```
Yoga Layout (flexbox computation)
    +
Custom double-buffer screen (cell-by-cell diff — inspired by blessed)
    +
ANSI output (chalk + ansi-escapes + synchronized output)
    +
Node.js stdin/stdout (keyboard events, raw terminal mode)
```

**Key technique — synchronized output (prevents flicker):**
```
\x1b[?2026h  // Begin synchronized update
... write all changes ...
\x1b[?2026l  // End synchronized update
```
Supported by modern terminals (iTerm2, WezTerm, kitty, Windows Terminal).

---

### Challenge 3: Dependency Injection

**Problem:** Angular's DI is one of its most loved features. Need to replicate `@Injectable()`, constructor injection, `InjectionToken`, and providers.

**Solution Options:**

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| A) Custom DI container (~300 LOC) | Full control, Angular-like API, lightweight | Engineering effort | **Best option** |
| B) tsyringe (Microsoft) | Closest to Angular simplicity, 4KB | No hierarchical injectors, less maintained | Good inspiration |
| C) InversifyJS | Most feature-rich, has child containers | Verbose binding API, un-Angular feel | Too heavy |
| D) TypeDI | Simple, auto-injection | Sporadic maintenance | Not recommended |

**Requirements for the DI container:**
- `@Injectable()` class decorator
- `@Inject(token)` parameter decorator
- `InjectionToken<T>` for non-class tokens
- `providers` array config (`useClass`, `useValue`, `useFactory`)
- Two-level hierarchy (root injector + screen/component-scoped)

**TypeScript config required:**
```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```
Plus `import 'reflect-metadata'` at entry point.

**Why legacy decorators, not TC39 Stage 3:**
TC39 decorators cannot read constructor parameter types at runtime. Auto-injection (`constructor(private ai: AiService)` without explicit `@Inject`) requires `reflect-metadata` + legacy decorators. The entire ecosystem (Angular, NestJS, tsyringe, InversifyJS) still uses legacy decorators.

---

### Challenge 4: Change Detection

**Problem:** When component state changes, the terminal UI needs to re-render. Angular uses Zone.js + dirty checking (or Signals in v17+). We need something lighter.

**Solution Options:**

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| A) Signal-based (like Angular 17+) | Modern, fine-grained, no Zone.js | Need to build signal primitives | **Best option** |
| B) RxJS-driven | Angular devs already know it, powerful | Can be complex for simple state | Complement to signals |
| C) Dirty checking (classic Angular) | Simple to understand | Wasteful — checks everything every cycle | Not recommended |
| D) Proxy-based reactivity (like Vue) | Automatic tracking | Implicit, harder to debug | Alternative |

**Recommended approach:** Build a lightweight signal system (like Angular's `signal()`, `computed()`, `effect()`) that triggers re-render of affected components. Use RxJS for async streams (AI responses, events) and convert to signals at the component boundary.

```typescript
// Angular 17+ style signals — no Zone.js needed
title = signal('AI Chat');
messages = signal<string[]>([]);
messageCount = computed(() => this.messages().length);
```

---

### Challenge 5: Structural Directives (`*ngFor`, `*ngIf`)

**Problem:** `*ngFor="let item of items"` is syntactic sugar that Angular desugars into `<ng-template>` form. We need to handle this desugaring and manage dynamic template instances.

**Solution:** This is a well-understood transformation:
```
*ngFor="let item of items; let i = index"
    ↓ desugars to
<ng-template ngFor let-item [ngForOf]="items" let-i="index">
```

The framework needs:
1. A microsyntax parser for the `*directive="..."` value
2. A template instantiation system that creates/destroys child views
3. Tracking for efficient list updates (like Angular's `trackBy`)

**Complexity:** Moderate. The parsing is straightforward; the efficient diffing of list items is the harder part (but can use a simple key-based approach initially).

---

### Challenge 6: Terminal Widget Primitives

**Problem:** HTML has `<div>`, `<span>`, `<input>`. We need terminal equivalents.

**Proposed terminal elements:**

| Element | Purpose | Maps to |
|---|---|---|
| `<box>` | Container with borders, padding | Yoga flex container + border chars |
| `<text>` | Text output | Styled string at computed position |
| `<input>` | Text input field | Readline-like with cursor |
| `<list>` | Scrollable list | Selectable items with keyboard nav |
| `<spinner>` | Loading indicator | Animated character sequence |
| `<progress>` | Progress bar | Filled/empty bar characters |
| `<table>` | Data table | Column-aligned text |
| `<select>` | Selection menu | Highlighted items with up/down |

---

## 3. Dependency Map

### Core dependencies (production)

| Package | Purpose | Size |
|---|---|---|
| `yoga-layout` | Flexbox layout engine | ~120KB (WASM) |
| `angular-html-parser` | Template syntax parsing | ~50KB |
| `jsep` | Expression parsing | ~5KB |
| `rxjs` | Reactive programming | ~30KB |
| `reflect-metadata` | Decorator metadata | ~3KB |
| `chalk` | ANSI color styling | ~10KB |
| `ansi-escapes` | Cursor/screen control | ~5KB |
| `string-width` | Accurate character width | ~3KB |
| `strip-ansi` | Remove ANSI codes | ~2KB |
| `cli-cursor` | Cursor visibility | ~1KB |

**Total:** ~240KB — lightweight compared to any web framework.

### No dependency on

- React (no react, react-reconciler)
- Angular (no @angular/*)
- Blessed / neo-blessed (unmaintained)
- Node native addons (yoga is WASM)

---

## 4. Risk Assessment

| Risk | Severity | Likelihood | Mitigation | Status |
|---|---|---|---|---|
| `angular-html-parser` stops being maintained | Medium | Low | Wrapped behind `TemplateParser` abstraction — fork or replace if needed | **RESOLVED** |
| Legacy decorators deprecated in TypeScript | High | Low (years away) | Abstract metadata access behind internal helpers; same bet as NestJS/Angular | **RESOLVED** |
| Yoga WASM compatibility issues | Low | Low | Yoga is maintained by Meta, used by React Native at massive scale | Accepted |
| Performance with complex UIs | Medium | Medium | Parse once + frame budget + dirty marking + synchronized output | **RESOLVED** |
| Terminal compatibility (Windows, SSH, etc.) | Medium | Medium | Test on major terminals; fall back gracefully for unsupported features | Accepted |
| Scope creep — trying to replicate all of Angular | High | High | NestJS-style selective borrowing — defined what to take and what to ignore | **RESOLVED** |
| Naming conflict with Angular CLI | High | High | Renamed to `ng-tui` — no conflicts | **RESOLVED** |

### Risk Resolution: Decorator Strategy (TC39 vs Legacy)

**Decision:** Use legacy decorators + `reflect-metadata` (same as NestJS, Angular, TypeORM).

**Why TC39 Stage 3 decorators are NOT viable for Angular-style DI:**
- TC39 decorators have NO parameter decorators (`@Inject()` on constructor args is impossible)
- TC39 decorators have NO automatic type metadata emission (`design:paramtypes`)
- Without these, auto-injection (`constructor(private ai: AiService)`) requires verbose workarounds
- No major framework has migrated to TC39 decorators yet (as of 2026)

**Migration safety net:**
All metadata access goes through internal helper functions:
```typescript
// If we ever migrate, only these functions change
export function getParamTypes(target: any): any[] {
  return Reflect.getMetadata('design:paramtypes', target) || [];
}
export function setInjectableMetadata(target: any): void {
  Reflect.defineMetadata('ng-tui:injectable', true, target);
}
```

### Risk Resolution: Scope Creep (NestJS-style boundary)

**What ng-tui borrows from Angular:**
- Decorators: `@Component`, `@Injectable`, `@Input`, `@Output`
- DI system: providers, injection tokens, hierarchical injectors
- Lifecycle hooks: `OnInit`, `OnDestroy`, `OnChanges`
- Template syntax: `{{ }}`, `[prop]`, `(event)`, `*ngFor`, `*ngIf`
- Pipes
- RxJS integration

**What ng-tui does NOT replicate:**
- NgModules (standalone components only)
- Zone.js (signals instead)
- Router (simpler screen navigation)
- Forms module (terminal inputs are simpler)
- HttpClient (use fetch)
- Animations
- AOT/JIT distinction

### Risk Resolution: Template Parser Dependency

**Decision:** Use `angular-html-parser` behind a `TemplateParser` interface abstraction.

**Pattern:** Same as NestJS wrapping Express/Fastify behind `HttpAdapter`. If the dependency dies, swap the implementation without changing the public API.

### Risk Resolution: Performance

**Three-layer mitigation:**
1. **Parse once:** Templates are parsed at component creation, never re-parsed. Only bindings are re-evaluated.
2. **Frame budgeting:** Batch state changes within 16ms windows. Skip intermediate frames during rapid updates (e.g., AI token streaming).
3. **Dirty marking:** Only re-render components whose inputs actually changed. No full-tree re-traversal.

---

## 5. What NOT to Replicate from Angular

Some Angular features make no sense in a terminal:

- **Router** — Terminal apps don't have URLs (but screen navigation is useful — build a simpler abstraction)
- **Forms module** — Overkill; terminal inputs are simpler
- **HttpClient** — Just use `fetch` or `node:http`
- **Animations** — Terminal "animations" are just spinner/progress updates
- **NgModules** — Angular is moving away from these; use standalone components from day one
- **Zone.js** — Use signals instead (Angular 17+ direction)
- **AOT / JIT compilation distinction** — Not relevant; always compile at startup

---

## 6. MVP Scope (Recommended)

### Phase 1: Core Framework
- [ ] `@CliComponent` decorator with template
- [ ] Template parser (angular-html-parser + expression evaluator)
- [ ] `{{ interpolation }}` bindings
- [ ] `[property]` bindings
- [ ] `(event)` bindings (keyboard events)
- [ ] `*ngIf` directive
- [ ] `*ngFor` directive
- [ ] `@Injectable()` + DI container
- [ ] Lifecycle hooks: `ngOnInit`, `ngOnDestroy`
- [ ] Terminal widgets: `<box>`, `<text>`, `<input>`
- [ ] Yoga-based flexbox layout
- [ ] Double-buffer ANSI renderer

### Phase 2: Developer Experience
- [ ] `@Input()` / `@Output()` for component communication
- [ ] Signal-based reactivity
- [ ] Pipes (`| uppercase`, `| date`, custom pipes)
- [ ] More widgets: `<list>`, `<spinner>`, `<progress>`, `<table>`, `<select>`
- [ ] CLI scaffolding tool (`ng-tui new my-app`)
- [ ] Hot reload during development

### Phase 3: Ecosystem
- [ ] RxJS deep integration
- [ ] AI service helpers (Claude, OpenAI SDK wrappers)
- [ ] Plugin system
- [ ] Themes / styling system
- [ ] Published to npm as `@ng-tui/core`
