import type { TBoundAttribute } from '../parser/ast.js';

/**
 * Resolves property bindings ([prop]="expression") into values.
 */
export function resolvePropertyBindings(
  inputs: TBoundAttribute[],
  evaluator: (expression: string) => any,
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const input of inputs) {
    result[input.name] = evaluator(input.expression);
  }

  return result;
}
