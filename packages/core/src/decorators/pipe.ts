import { setPipeMetadata, setInjectableMetadata } from '../di/metadata.js';

/**
 * Marks a class as a pipe for template expressions.
 *
 * @example
 * @Pipe({ name: 'uppercase' })
 * export class UppercasePipe implements PipeTransform {
 *   transform(value: string): string {
 *     return value.toUpperCase();
 *   }
 * }
 */
export function Pipe(def: { name: string }): ClassDecorator {
  return (target) => {
    setPipeMetadata(target, def);
    setInjectableMetadata(target);
  };
}
