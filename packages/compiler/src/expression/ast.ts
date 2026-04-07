/**
 * Expression AST node types.
 */

export type ExprNode =
  | LiteralExpr
  | IdentifierExpr
  | MemberExpr
  | CallExpr
  | PipeExpr
  | ConditionalExpr
  | BinaryExpr
  | UnaryExpr
  | ArrayExpr;

export interface LiteralExpr {
  type: 'literal';
  value: any;
}

export interface IdentifierExpr {
  type: 'identifier';
  name: string;
}

export interface MemberExpr {
  type: 'member';
  object: ExprNode;
  property: string;
}

export interface CallExpr {
  type: 'call';
  callee: ExprNode;
  args: ExprNode[];
}

export interface PipeExpr {
  type: 'pipe';
  expression: ExprNode;
  name: string;
  args: ExprNode[];
}

export interface ConditionalExpr {
  type: 'conditional';
  test: ExprNode;
  consequent: ExprNode;
  alternate: ExprNode;
}

export interface BinaryExpr {
  type: 'binary';
  operator: string;
  left: ExprNode;
  right: ExprNode;
}

export interface UnaryExpr {
  type: 'unary';
  operator: string;
  argument: ExprNode;
}

export interface ArrayExpr {
  type: 'array';
  elements: ExprNode[];
}
