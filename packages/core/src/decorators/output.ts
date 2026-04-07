import { setOutputMetadata } from '../di/metadata.js';

/**
 * Marks a property as an output event emitter.
 *
 * @example
 * @Output() submit = new EventEmitter<string>();
 * @Output('onSubmit') submit = new EventEmitter<string>();  // with alias
 */
export function Output(alias?: string): PropertyDecorator {
  return (target, propertyKey) => {
    setOutputMetadata(target, propertyKey as string, alias);
  };
}
