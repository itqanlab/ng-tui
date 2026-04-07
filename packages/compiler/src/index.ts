// Parser
export { AngularParserAdapter } from './parser/index.js';
export type {
  TemplateParser,
  TemplateParseResult,
  TemplateParseError,
  TNode,
  TElement,
  TText,
  TBoundText,
  TInterpolation,
  TAttribute,
  TBoundAttribute,
  TBoundEvent,
  TTemplate,
  TVariable,
} from './parser/index.js';

// Expression
export { ExpressionParser, ExpressionEvaluator, PipeRegistry } from './expression/index.js';
export type {
  ExprNode,
  LiteralExpr,
  IdentifierExpr,
  MemberExpr,
  CallExpr,
  PipeExpr,
  ConditionalExpr,
  BinaryExpr,
  UnaryExpr,
  ArrayExpr,
} from './expression/index.js';

// Directives
export { MicrosyntaxParser, NgForCompiler, NgIfCompiler, NgSwitchCompiler } from './directives/index.js';
export type { NgForContext, NgIfContext } from './directives/index.js';

// Bindings
export {
  resolveInterpolation,
  resolvePropertyBindings,
  resolveEventBindings,
  splitTwoWayBinding,
} from './bindings/index.js';

// Compilation
export { TemplateCompiler, ViewFactory } from './compilation/index.js';
export type { CompiledTemplate, ViewRef } from './compilation/index.js';
