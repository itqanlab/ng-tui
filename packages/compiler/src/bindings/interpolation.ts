import type { TInterpolation } from '../parser/ast.js';

/**
 * Resolves a text string containing {{ interpolations }} into a final string.
 */
export function resolveInterpolation(
  rawText: string,
  interpolations: TInterpolation[],
  evaluator: (expression: string) => any,
): string {
  if (interpolations.length === 0) return rawText;

  let result = '';
  let lastIndex = 0;

  for (const interp of interpolations) {
    // Add static text before this interpolation
    result += rawText.slice(lastIndex, interp.start);
    // Evaluate and stringify
    const value = evaluator(interp.expression);
    result += value != null ? String(value) : '';
    lastIndex = interp.end;
  }

  // Add remaining static text
  result += rawText.slice(lastIndex);
  return result;
}
