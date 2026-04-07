# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ng-tui is an Angular-syntax terminal UI framework. It lets developers build interactive terminal apps using Angular-like decorators, DI, signals, and template syntax, rendered to the terminal via a double-buffer ANSI diff renderer with Yoga (WASM) flexbox layout.

## Commands

```bash
pnpm build          # Build all packages (via Nx)
pnpm test           # Run all tests (Vitest)
pnpm lint           # Lint with Biome
pnpm lint:fix       # Auto-fix lint issues
pnpm format         # Auto-format with Biome

# Single package operations
npx nx test core              # Test @ng-tui/core only
npx nx build platform-terminal  # Build a specific package
npx nx test compiler --testNamePattern="expression"  # Run specific tests
```

## Architecture

**Monorepo:** Nx + pnpm workspaces. 5 packages under `packages/`.

**Dependency graph (build order):**
```
1. @ng-tui/core                  — Foundation: decorators, DI, signals, lifecycle
2. @ng-tui/common                — Pipes (uppercase, date, ansi), directives (ngFor, ngIf, ngSwitch)
   @ng-tui/compiler              — Template parser, expression evaluator, directive compilation
3. @ng-tui/platform-terminal     — Terminal renderer, Yoga layout, widgets, input events
4. @ng-tui/cli                   — Scaffolding CLI (ng-tui new, generate, serve, build)
```

**Key design boundaries:**
- `core` has zero knowledge of terminals or templates
- `compiler` has zero knowledge of terminals — outputs compiled templates consumed by platform-terminal
- `platform-terminal` never parses templates — only receives compiled output
- `common` provides runtime directive/pipe implementations, not compilation logic

**Compilation pipeline:** Template string → angular-html-parser AST → directive desugaring → binding extraction → jsep expression parsing → CompiledTemplate (parse once, evaluate many)

**Rendering pipeline:** Signal change → dirty binding detection → expression re-eval → Yoga flexbox layout → widget cell rendering → buffer diff → minimal ANSI output

## Code Style

- **Formatter:** Biome — 2-space indent, 100-char line width, single quotes, always semicolons, trailing commas
- **Linting:** Biome recommended rules, `noForEach` disabled
- **Module format:** ES2022 ESM
- **TypeScript:** Strict mode, decorators + metadata enabled (for DI system)
- **Test files:** `src/**/*.spec.ts` in each package, Vitest with globals enabled

## Key Dependencies

- `yoga-layout` — Flexbox layout engine (WASM)
- `angular-html-parser` — Template syntax parsing (behind TemplateParser abstraction)
- `jsep` — Expression parsing
- `reflect-metadata` — Decorator metadata for DI (abstracted via `metadata.ts` for future TC39 decorator migration)
- `chalk` — ANSI color styling

## Path Aliases

Defined in `tsconfig.base.json`:
- `@ng-tui/core` → `packages/core/src/index.ts`
- `@ng-tui/common` → `packages/common/src/index.ts`
- `@ng-tui/compiler` → `packages/compiler/src/index.ts`
- `@ng-tui/platform-terminal` → `packages/platform-terminal/src/index.ts`
- `@ng-tui/cli` → `packages/cli/src/index.ts`
