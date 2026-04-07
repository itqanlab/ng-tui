import { setInputMetadata } from '../di/metadata.js';

/**
 * Marks a property as an input binding.
 *
 * @example
 * @Input() title = '';
 * @Input('label') title = '';  // with alias
 */
export function Input(alias?: string): PropertyDecorator {
  return (target, propertyKey) => {
    setInputMetadata(target, propertyKey as string, alias);
  };
}
