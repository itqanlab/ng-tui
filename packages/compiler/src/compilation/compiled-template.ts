import type { TNode } from '../parser/ast.js';

/**
 * A compiled template — the parse-once result.
 * Contains the AST tree and metadata needed for rendering.
 */
export interface CompiledTemplate {
  /** The parsed AST nodes */
  nodes: TNode[];
  /** Whether the template has any interpolations */
  hasInterpolations: boolean;
  /** Whether the template has any structural directives */
  hasStructuralDirectives: boolean;
}
