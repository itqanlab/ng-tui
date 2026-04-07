/**
 * Splits [(prop)]="value" two-way binding into [prop] and (propChange).
 * This is syntactic sugar handled at the parser level.
 */
export function splitTwoWayBinding(name: string): { input: string; output: string } | null {
  // [(prop)] — banana-in-a-box syntax
  if (name.startsWith('[(') && name.endsWith(')]')) {
    const propName = name.slice(2, -2);
    return {
      input: propName,
      output: `${propName}Change`,
    };
  }
  return null;
}
