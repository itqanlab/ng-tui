import jsep from 'jsep';
import type { ExprNode, PipeExpr } from './ast.js';

/**
 * Parses Angular-like template expressions.
 * Uses jsep for the base JS expression parsing and adds pipe support.
 *
 * Supported: member access, method calls, literals, ternary, binary ops, pipes.
 * Not supported: assignment, new, template literals.
 */
export class ExpressionParser {
  /**
   * Parse an expression string into an AST.
   * Handles pipe syntax: "value | pipeName:arg1:arg2"
   */
  parse(expression: string): ExprNode {
    const trimmed = expression.trim();

    // Handle pipes: split on | that are not inside strings or parens
    const pipeParts = this.splitPipes(trimmed);

    if (pipeParts.length === 1) {
      // No pipes — parse as plain expression
      return this.parseJsep(pipeParts[0]);
    }

    // Build pipe chain: expr | pipe1:arg | pipe2:arg
    let result: ExprNode = this.parseJsep(pipeParts[0]);

    for (let i = 1; i < pipeParts.length; i++) {
      const pipeExpr = pipeParts[i].trim();
      const colonParts = this.splitPipeArgs(pipeExpr);
      const pipeName = colonParts[0].trim();
      const pipeArgs = colonParts.slice(1).map((arg) => this.parseJsep(arg.trim()));

      result = {
        type: 'pipe',
        expression: result,
        name: pipeName,
        args: pipeArgs,
      } as PipeExpr;
    }

    return result;
  }

  private parseJsep(expression: string): ExprNode {
    try {
      const tree = jsep(expression.trim());
      return this.convertJsepNode(tree);
    } catch {
      // Fallback: treat as identifier
      return { type: 'identifier', name: expression.trim() } as ExprNode;
    }
  }

  private convertJsepNode(node: jsep.Expression): ExprNode {
    switch (node.type) {
      case 'Literal':
        return { type: 'literal', value: (node as any).value };

      case 'Identifier':
        return { type: 'identifier', name: (node as any).name };

      case 'MemberExpression': {
        const member = node as any;
        if (member.computed) {
          // array[index] — treat as member with computed property
          return {
            type: 'member',
            object: this.convertJsepNode(member.object),
            property: String((member.property as any).value ?? (member.property as any).name),
          };
        }
        return {
          type: 'member',
          object: this.convertJsepNode(member.object),
          property: (member.property as any).name,
        };
      }

      case 'CallExpression': {
        const call = node as any;
        return {
          type: 'call',
          callee: this.convertJsepNode(call.callee),
          args: call.arguments.map((arg: jsep.Expression) => this.convertJsepNode(arg)),
        };
      }

      case 'ConditionalExpression': {
        const cond = node as any;
        return {
          type: 'conditional',
          test: this.convertJsepNode(cond.test),
          consequent: this.convertJsepNode(cond.consequent),
          alternate: this.convertJsepNode(cond.alternate),
        };
      }

      case 'BinaryExpression':
      case 'LogicalExpression': {
        const binary = node as any;
        return {
          type: 'binary',
          operator: binary.operator,
          left: this.convertJsepNode(binary.left),
          right: this.convertJsepNode(binary.right),
        };
      }

      case 'UnaryExpression': {
        const unary = node as any;
        return {
          type: 'unary',
          operator: unary.operator,
          argument: this.convertJsepNode(unary.argument),
        };
      }

      case 'ArrayExpression': {
        const arr = node as any;
        return {
          type: 'array',
          elements: arr.elements.map((el: jsep.Expression) => this.convertJsepNode(el)),
        };
      }

      default:
        return { type: 'literal', value: undefined };
    }
  }

  /** Split on | that are not inside strings, parens, or brackets */
  private splitPipes(expr: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    let inString: string | null = null;

    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];

      if (inString) {
        current += ch;
        if (ch === inString && expr[i - 1] !== '\\') inString = null;
        continue;
      }

      if (ch === "'" || ch === '"' || ch === '`') {
        inString = ch;
        current += ch;
        continue;
      }

      if (ch === '(' || ch === '[') { depth++; current += ch; continue; }
      if (ch === ')' || ch === ']') { depth--; current += ch; continue; }

      if (ch === '|' && depth === 0 && expr[i + 1] !== '|') {
        parts.push(current);
        current = '';
        continue;
      }

      current += ch;
    }

    parts.push(current);
    return parts;
  }

  /** Split pipe arguments on : */
  private splitPipeArgs(pipeExpr: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inString: string | null = null;

    for (let i = 0; i < pipeExpr.length; i++) {
      const ch = pipeExpr[i];

      if (inString) {
        current += ch;
        if (ch === inString && pipeExpr[i - 1] !== '\\') inString = null;
        continue;
      }

      if (ch === "'" || ch === '"') {
        inString = ch;
        current += ch;
        continue;
      }

      if (ch === ':') {
        parts.push(current);
        current = '';
        continue;
      }

      current += ch;
    }

    parts.push(current);
    return parts;
  }
}
