# @ng-tui/cli

Scaffolding CLI for ng-tui projects. Provides commands for creating new projects, generating components/services/pipes, and running dev/build workflows.

## Commands

### ng-tui new

Scaffold a new ng-tui project:

```bash
npx ng-tui new my-app
npx ng-tui new my-app --directory ./projects
```

```typescript
interface NewCommandOptions {
  name: string;
  directory?: string;
}

function newCommand(options: NewCommandOptions): Promise<void>;
```

### ng-tui generate

Generate boilerplate for components, services, or pipes:

```bash
npx ng-tui generate component my-widget
npx ng-tui generate service api
npx ng-tui generate pipe format-bytes
npx ng-tui generate component sidebar --path src/components
```

```typescript
type Schematic = 'component' | 'service' | 'pipe';

interface GenerateCommandOptions {
  schematic: Schematic;
  name: string;
  path?: string;
}

function generateCommand(options: GenerateCommandOptions): Promise<void>;
```

### ng-tui serve

Run the app in development mode with file watching:

```bash
npx ng-tui serve
npx ng-tui serve --port 3000
npx ng-tui serve --watch false
```

```typescript
interface ServeCommandOptions {
  port?: number;
  watch?: boolean;
}

function serveCommand(options?: ServeCommandOptions): Promise<void>;
```

### ng-tui build

Compile the project for distribution:

```bash
npx ng-tui build
npx ng-tui build --outDir dist
```

```typescript
interface BuildCommandOptions {
  outDir?: string;
}

function buildCommand(options?: BuildCommandOptions): Promise<void>;
```

## Utilities

### renderTemplate

Replace `__key__` placeholders in template strings with variable values:

```typescript
function renderTemplate(content: string, variables: Record<string, string>): string;
```

```typescript
renderTemplate('Hello __name__!', { name: 'World' });
// 'Hello World!'
```

### Case Conversion

```typescript
function toKebabCase(str: string): string;
// 'MyComponent' → 'my-component'

function toPascalCase(str: string): string;
// 'my-component' → 'MyComponent'

function toCamelCase(str: string): string;
// 'my-component' → 'myComponent'
```

## Usage with npx

```bash
# Scaffold a new project
npx ng-tui new my-terminal-app

# Navigate into it
cd my-terminal-app

# Generate a component
npx ng-tui generate component dashboard

# Start dev mode
npx ng-tui serve

# Build for production
npx ng-tui build
```
