import type { TBoundEvent } from '../parser/ast.js';

/**
 * Maps event bindings ((event)="handler($event)") to handler functions.
 */
export function resolveEventBindings(
  outputs: TBoundEvent[],
  context: Record<string, any>,
): Record<string, (...args: any[]) => void> {
  const result: Record<string, (...args: any[]) => void> = {};

  for (const output of outputs) {
    result[output.name] = ($event?: any) => {
      // Simple handler evaluation — call the method on the context
      const handlerMatch = output.handler.match(/^(\w+)\((.*)\)$/);
      if (handlerMatch) {
        const methodName = handlerMatch[1];
        const fn = context[methodName];
        if (typeof fn === 'function') {
          // Replace $event in args
          const argStr = handlerMatch[2].trim();
          if (argStr === '$event') {
            fn.call(context, $event);
          } else if (argStr === '') {
            fn.call(context);
          } else {
            fn.call(context, $event);
          }
        }
      }
    };
  }

  return result;
}
