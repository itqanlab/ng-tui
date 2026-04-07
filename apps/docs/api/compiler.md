# @ng-tui/compiler

Template parser, expression evaluator, and directive compilation. This package has zero knowledge of terminals — it outputs compiled templates consumed by `@ng-tui/platform-terminal`.

## Template Compilation

### TemplateCompiler

Main orchestrator that parses a template string and produces a `CompiledTemplate`.

```typescript
class TemplateCompiler {
  constructor(parser?: TemplateParser);
  compile(template: string): CompiledTemplate;
}
```

**Usage:**

```typescript
import { TemplateCompiler } from '@ng-tui/compiler';

const compiler = new TemplateCompiler();
const compiled = compiler.compile(`
  <box [borderStyle]="'rounded'">
    <text *ngFor="let item of items()">{{ item }}</text>
  </box>
`);

compiled.nodes;                   // TNode[] — parsed AST
compiled.hasInterpolations;       // true
compiled.hasStructuralDirectives; // true
```

### CompiledTemplate

```typescript
interface CompiledTemplate {
  nodes: TNode[];
  hasInterpolations: boolean;
  hasStructuralDirectives: boolean;
}
```

## Template Parsing

### TemplateParser (Interface)

```typescript
interface TemplateParser {
  parse(template: string): TemplateParseResult;
}

interface TemplateParseResult {
  nodes: TNode[];
  errors: TemplateParseError[];
}

interface TemplateParseError {
  message: string;
  line?: number;
  column?: number;
}
```

### AngularParserAdapter

Default implementation using `angular-html-parser`:

```typescript
class AngularParserAdapter implements TemplateParser {
  parse(template: string): TemplateParseResult;
}
```

## AST Node Types

The template AST represents the parsed template structure:

### TNode

Union type of all node types:

```typescript
type TNode = TElement | TText | TBoundText | TTemplate;
```

### TElement

An HTML-like element with bindings:

```typescript
interface TElement {
  type: 'element';
  name: string;              // e.g., 'box', 'text', 'input'
  attributes: TAttribute[];  // static attributes
  inputs: TBoundAttribute[]; // [prop]="expr" bindings
  outputs: TBoundEvent[];    // (event)="handler" bindings
  children: TNode[];
}
```

### TText

Plain text node:

```typescript
interface TText {
  type: 'text';
  value: string;
}
```

### TBoundText

Text with interpolation expressions:

```typescript
interface TBoundText {
  type: 'boundText';
  rawText: string;               // Original text with {{ }}
  expressions: TInterpolation[];
}

interface TInterpolation {
  expression: string;  // The expression inside {{ }}
  start: number;       // Position in rawText
  end: number;
}
```

### TTemplate

Structural directive (desugared from `*ngFor`, `*ngIf`, etc.):

```typescript
interface TTemplate {
  type: 'template';
  directive: string;         // 'ngFor', 'ngIf', 'ngSwitch'
  expression: string;        // The directive expression
  variables: TVariable[];    // let-bindings
  children: TNode[];
}

interface TVariable {
  name: string;
  value?: string;
}
```

### TAttribute / TBoundAttribute / TBoundEvent

```typescript
interface TAttribute {
  name: string;
  value: string;
}

interface TBoundAttribute {
  name: string;        // Property name
  expression: string;  // Expression to evaluate
}

interface TBoundEvent {
  name: string;        // Event name
  handler: string;     // Handler expression
}
```

## Expression Parsing

### ExpressionParser

Parses Angular-like template expressions with pipe support:

```typescript
class ExpressionParser {
  parse(expression: string): ExprNode;
}
```

**Supported expressions:**

```typescript
const parser = new ExpressionParser();

parser.parse('42');                    // LiteralExpr
parser.parse('name');                  // IdentifierExpr
parser.parse('user.name');             // MemberExpr
parser.parse('getTitle()');            // CallExpr
parser.parse('a + b');                 // BinaryExpr
parser.parse('!done');                 // UnaryExpr
parser.parse('x ? y : z');            // ConditionalExpr
parser.parse('[1, 2, 3]');            // ArrayExpr
parser.parse('name | uppercase');      // PipeExpr
parser.parse('date | date:"long"');    // PipeExpr with args
```

### Expression AST Types

```typescript
type ExprNode =
  | LiteralExpr
  | IdentifierExpr
  | MemberExpr
  | CallExpr
  | PipeExpr
  | ConditionalExpr
  | BinaryExpr
  | UnaryExpr
  | ArrayExpr;

interface LiteralExpr    { type: 'literal'; value: any; }
interface IdentifierExpr { type: 'identifier'; name: string; }
interface MemberExpr     { type: 'member'; object: ExprNode; property: string; }
interface CallExpr       { type: 'call'; callee: ExprNode; arguments: ExprNode[]; }
interface PipeExpr       { type: 'pipe'; name: string; expression: ExprNode; arguments: ExprNode[]; }
interface ConditionalExpr { type: 'conditional'; test: ExprNode; consequent: ExprNode; alternate: ExprNode; }
interface BinaryExpr     { type: 'binary'; operator: string; left: ExprNode; right: ExprNode; }
interface UnaryExpr      { type: 'unary'; operator: string; argument: ExprNode; }
interface ArrayExpr      { type: 'array'; elements: ExprNode[]; }
```

## Expression Evaluation

### ExpressionEvaluator

Evaluates parsed expression ASTs against a component context:

```typescript
class ExpressionEvaluator {
  registerPipe(name: string, transform: (...args: any[]) => any): void;
  evaluate(node: ExprNode, context: any): any;
}
```

**Usage:**

```typescript
import { ExpressionParser, ExpressionEvaluator } from '@ng-tui/compiler';

const parser = new ExpressionParser();
const evaluator = new ExpressionEvaluator();

evaluator.registerPipe('uppercase', (val: string) => val.toUpperCase());

const ast = parser.parse('name | uppercase');
const result = evaluator.evaluate(ast, { name: 'hello' });
// result: 'HELLO'
```

### PipeRegistry

Central registry for pipe transform functions:

```typescript
class PipeRegistry {
  registerPipe(name: string, transform: (...args: any[]) => any): void;
  getPipe(name: string): ((...args: any[]) => any) | undefined;
}
```

## Binding Utilities

### resolveInterpolation

Resolves <code v-pre>{{ }}</code> interpolations in text:

```typescript
function resolveInterpolation(
  rawText: string,
  expressions: TInterpolation[],
  evalFn: (expr: string) => any
): string;
```

### resolvePropertyBindings

Resolves `[prop]="expr"` bindings:

```typescript
function resolvePropertyBindings(
  inputs: TBoundAttribute[],
  evalFn: (expr: string) => any
): Record<string, any>;
```

### resolveEventBindings

Resolves `(event)="handler"` bindings:

```typescript
function resolveEventBindings(
  outputs: TBoundEvent[],
  context: any
): Record<string, Function>;
```

### splitTwoWayBinding

Parses two-way binding syntax:

```typescript
function splitTwoWayBinding(binding: string): { input: string; output: string } | null;
```

## Directive Compilers

### NgForCompiler

Compiles `*ngFor` microsyntax into template nodes:

```typescript
class NgForCompiler {
  // Compiles: *ngFor="let item of items; let i = index"
}
```

### NgIfCompiler

Compiles `*ngIf` expressions:

```typescript
class NgIfCompiler {
  // Compiles: *ngIf="condition"
}
```

### NgSwitchCompiler

Compiles `*ngSwitch` / `*ngSwitchCase` / `*ngSwitchDefault`:

```typescript
class NgSwitchCompiler {}
```

### MicrosyntaxParser

Parses structural directive microsyntax (the expression after `*ngFor=`, `*ngIf=`, etc.):

```typescript
class MicrosyntaxParser {
  // Parses: "let item of items; let i = index; trackBy: trackByFn"
}
```

## View Factory

### ViewFactory

Creates view references from compiled templates:

```typescript
class ViewFactory {
  createView(compiled: CompiledTemplate, instance: any): ViewRef;
}
```

### ViewRef

```typescript
interface ViewRef {
  context: Record<string, any>;
  destroy(): void;
}
```
