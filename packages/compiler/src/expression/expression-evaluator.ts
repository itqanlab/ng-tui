import type { ExprNode } from './ast.js';

/**
 * Evaluates a parsed expression AST against a component context.
 */
export class ExpressionEvaluator {
  private pipes: Map<string, (value: any, ...args: any[]) => any> = new Map();

  /**
   * Register a pipe function by name.
   */
  registerPipe(name: string, transform: (value: any, ...args: any[]) => any): void {
    this.pipes.set(name, transform);
  }

  /**
   * Evaluate an expression against the given context object.
   */
  evaluate(node: ExprNode, context: Record<string, any>): any {
    switch (node.type) {
      case 'literal':
        return (node as any).value;

      case 'identifier':
        return context[(node as any).name];

      case 'member': {
        const obj = this.evaluate((node as any).object, context);
        if (obj == null) return undefined;
        return obj[(node as any).property];
      }

      case 'call': {
        const callee = (node as any).callee;
        const args = (node as any).args.map((arg: ExprNode) => this.evaluate(arg, context));

        if (callee.type === 'member') {
          const obj = this.evaluate(callee.object, context);
          if (obj == null) return undefined;
          const fn = obj[callee.property];
          return typeof fn === 'function' ? fn.apply(obj, args) : undefined;
        }

        const fn = this.evaluate(callee, context);
        return typeof fn === 'function' ? fn(...args) : undefined;
      }

      case 'pipe': {
        const value = this.evaluate((node as any).expression, context);
        const pipeName = (node as any).name;
        const pipeArgs = (node as any).args.map((arg: ExprNode) => this.evaluate(arg, context));
        const pipeFn = this.pipes.get(pipeName);
        if (!pipeFn) {
          throw new Error(`Unknown pipe: ${pipeName}`);
        }
        return pipeFn(value, ...pipeArgs);
      }

      case 'conditional': {
        const test = this.evaluate((node as any).test, context);
        return test
          ? this.evaluate((node as any).consequent, context)
          : this.evaluate((node as any).alternate, context);
      }

      case 'binary': {
        const left = this.evaluate((node as any).left, context);
        const right = this.evaluate((node as any).right, context);
        return this.evaluateBinary((node as any).operator, left, right);
      }

      case 'unary': {
        const argument = this.evaluate((node as any).argument, context);
        return this.evaluateUnary((node as any).operator, argument);
      }

      case 'array': {
        return (node as any).elements.map((el: ExprNode) => this.evaluate(el, context));
      }

      default:
        return undefined;
    }
  }

  private evaluateBinary(operator: string, left: any, right: any): any {
    switch (operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '%': return left % right;
      case '===': return left === right;
      case '!==': return left !== right;
      case '==': return left == right;
      case '!=': return left != right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      case '&&': return left && right;
      case '||': return left || right;
      default: return undefined;
    }
  }

  private evaluateUnary(operator: string, argument: any): any {
    switch (operator) {
      case '!': return !argument;
      case '-': return -argument;
      case '+': return +argument;
      default: return undefined;
    }
  }
}
