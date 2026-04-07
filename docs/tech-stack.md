# ng-tui: Tech Stack Decision

## Monorepo Tooling: Nx vs pnpm + Turborepo

Two viable paths emerged from research. Both work, but they serve different philosophies.

### Option A: Nx Workspace

```
Nx (orchestration + generators + caching + publishing)
├── @nx/js (TypeScript library plugin)
├── tsc or swc (build via Nx executors)
├── Vitest (test via Nx executors)
└── nx release (versioning + changelog + npm publish)
```

| Pros | Cons |
|---|---|
| All-in-one: build, test, cache, publish, generate | Heavier setup, steeper learning curve |
| `nx g @nx/js:lib` scaffolds publishable packages instantly | Nx-specific config files (project.json, nx.json) |
| `nx release` handles versioning + changelog + publish | Opinionated — harder to eject if needed |
| `nx affected` only builds/tests what changed | Adds ~50MB to node_modules |
| `nx graph` visualizes package dependencies | |
| Can create `@ng-tui/nx-plugin` later for users | |
| NestJS-like ecosystem story | |

### Option B: pnpm + Turborepo + tsup + Changesets

```
pnpm workspaces (package management)
├── Turborepo (orchestration + caching)
├── tsup (build — wraps esbuild, zero-config)
├── Vitest (test)
└── Changesets (versioning + changelog + npm publish)
```

| Pros | Cons |
|---|---|
| Lighter, each tool does one thing well | More tools to configure and wire together |
| tsup is zero-config for library builds | No code generators built-in |
| pnpm `workspace:*` auto-converts on publish | No `nx graph` equivalent |
| Changesets is the npm standard for versioning | No plugin system for end users |
| Easier to understand each piece | Need to manually scaffold packages |
| Lower node_modules footprint | |

### Recommendation: Nx

**Reason:** ng-tui is a **framework** — not just a library. The NestJS parallel is key:

- NestJS uses its own monorepo tooling and ships `@nestjs/schematics` for code generation
- ng-tui will eventually need `@ng-tui/nx-plugin` to let users scaffold apps/components
- `nx release` handles the complex multi-package publish workflow out of the box
- `nx affected` is critical when working across 5+ interdependent packages
- The overhead is worth it for a framework project

---

## Complete Tech Stack

### Core

| Category | Choice | Why |
|---|---|---|
| **Language** | TypeScript 5.x | Decorators, type safety, Angular DX |
| **Runtime** | Node.js >= 22 | Current LTS, stable WASM, native ESM |
| **Module format** | ESM primary (+ CJS fallback) | Ecosystem direction, Node 22+ native support |

### Monorepo & Build

| Category | Choice | Why |
|---|---|---|
| **Monorepo** | Nx (`--preset=ts`) | All-in-one: build, cache, graph, release, generators |
| **Package manager** | pnpm | Content-addressable store, `workspace:*` protocol, strict deps |
| **Build** | tsc (via @nx/js) | Nx handles orchestration; tsc for .d.ts accuracy. tsup as alternative if we need bundling later |
| **Publish** | `nx release` | Versioning + changelog + npm publish for all `@ng-tui/*` packages |

### Quality

| Category | Choice | Why |
|---|---|---|
| **Test** | Vitest | 10-20x faster than Jest, native TS/ESM, great snapshots |
| **Lint & Format** | Biome | 25x faster than ESLint+Prettier, single binary, single config |
| **Terminal output testing** | Vitest snapshots + `strip-ansi` | Capture ANSI output, strip codes, snapshot match |

### Framework Dependencies (Production)

| Package | Purpose | Size |
|---|---|---|
| `yoga-layout` | Flexbox layout engine (WASM) | ~120KB |
| `angular-html-parser` | Template syntax parsing | ~50KB |
| `jsep` | Expression parsing | ~5KB |
| `rxjs` | Reactive programming | ~30KB |
| `reflect-metadata` | Decorator metadata for DI | ~3KB |
| `chalk` | ANSI color styling | ~10KB |
| `ansi-escapes` | Cursor/screen control | ~5KB |
| `string-width` | Accurate character width (CJK, emoji) | ~3KB |
| `strip-ansi` | Remove ANSI codes for width calc | ~2KB |
| `cli-cursor` | Cursor visibility | ~1KB |
| **Total** | | **~230KB** |

### Dev Dependencies

| Package | Purpose |
|---|---|
| `nx` | Monorepo orchestration |
| `@nx/js` | TypeScript library plugin |
| `vitest` | Testing |
| `@biomejs/biome` | Linting + formatting |
| `typescript` | Compiler |

### NOT Using

| Tool | Why Not |
|---|---|
| React / react-reconciler | Framework independence — ng-tui has its own renderer |
| Angular / @angular/* | We replicate syntax, not the framework |
| Blessed / neo-blessed | Unmaintained since 2017 |
| Jest | Vitest is faster and has native ESM/TS |
| ESLint + Prettier | Biome does both, 25x faster |
| Webpack / Rollup | Nx + tsc is sufficient for library packages |
| Zone.js | Using signals instead |
| Lerna | Delegates to Nx internally — just use Nx directly |

---

## Package Structure

```
ng-tui/                          (Nx workspace root)
├── nx.json                      (Nx config — caching, task pipeline)
├── pnpm-workspace.yaml          (pnpm workspaces)
├── biome.json                   (lint + format config)
├── tsconfig.base.json           (shared TS config)
├── packages/
│   ├── core/                    → @ng-tui/core
│   │   ├── src/
│   │   │   ├── decorators/      (Component, Injectable, Input, Output)
│   │   │   ├── di/              (Injector, providers, tokens)
│   │   │   ├── lifecycle/       (OnInit, OnDestroy, OnChanges)
│   │   │   ├── signals/         (signal, computed, effect)
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── compiler/                → @ng-tui/compiler
│   │   ├── src/
│   │   │   ├── parser/          (angular-html-parser wrapper)
│   │   │   ├── expression/      (jsep-based expression evaluator)
│   │   │   ├── directives/      (*ngFor, *ngIf desugaring)
│   │   │   ├── bindings/        (property, event, interpolation)
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── platform-terminal/       → @ng-tui/platform-terminal
│   │   ├── src/
│   │   │   ├── renderer/        (double-buffer ANSI diff renderer)
│   │   │   ├── layout/          (yoga-layout integration)
│   │   │   ├── widgets/         (box, text, input, list, spinner)
│   │   │   ├── events/          (keyboard, mouse, resize)
│   │   │   ├── screen/          (screen buffer, cursor management)
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── common/                  → @ng-tui/common
│   │   ├── src/
│   │   │   ├── pipes/           (uppercase, lowercase, date, json)
│   │   │   ├── directives/      (ngFor, ngIf, ngSwitch)
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── cli/                     → @ng-tui/cli
│       ├── src/
│       │   ├── commands/        (new, generate, serve)
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── examples/
│   └── ai-chat/                 (example app built with ng-tui)
├── docs/
│   ├── idea.md
│   ├── research.md
│   └── tech-stack.md
└── README.md
```

---

## TypeScript Configuration

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

---

## Nx Workspace Setup Commands

```bash
# 1. Create Nx workspace with TypeScript preset
npx create-nx-workspace@latest ng-tui --preset=ts --pm=pnpm

# 2. Add @nx/js plugin for TypeScript libraries
pnpm add -D @nx/js

# 3. Generate publishable packages
nx g @nx/js:lib packages/core --publishable --importPath=@ng-tui/core --unitTestRunner=vitest
nx g @nx/js:lib packages/common --publishable --importPath=@ng-tui/common --unitTestRunner=vitest
nx g @nx/js:lib packages/compiler --publishable --importPath=@ng-tui/compiler --unitTestRunner=vitest
nx g @nx/js:lib packages/platform-terminal --publishable --importPath=@ng-tui/platform-terminal --unitTestRunner=vitest
nx g @nx/js:lib packages/cli --publishable --importPath=@ng-tui/cli --unitTestRunner=vitest

# 4. Add Biome
pnpm add -D @biomejs/biome
npx biome init

# 5. Add framework dependencies
pnpm add yoga-layout angular-html-parser jsep rxjs reflect-metadata chalk ansi-escapes string-width strip-ansi cli-cursor --filter @ng-tui/core
```

---

## Dependency Graph

```
@ng-tui/core (decorators, DI, signals, lifecycle)
    ↑
@ng-tui/common (pipes, directives — depends on core)
    ↑
@ng-tui/compiler (template parser, expression eval — depends on core)
    ↑
@ng-tui/platform-terminal (renderer, layout, widgets — depends on core + compiler)
    ↑
@ng-tui/cli (scaffolding tool — depends on all above)
```

`nx affected` uses this graph to only rebuild what changed.
