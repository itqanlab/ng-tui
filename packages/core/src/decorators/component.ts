import type { ComponentDef } from '../types/component-def.js';
import { setComponentMetadata } from '../di/metadata.js';
import { setInjectableMetadata } from '../di/metadata.js';

/**
 * Marks a class as a ng-tui component with a template and selector.
 *
 * @example
 * @Component({
 *   selector: 'app-root',
 *   template: `<box><text>Hello</text></box>`
 * })
 * export class AppComponent {}
 */
export function Component(def: ComponentDef): ClassDecorator {
  return (target) => {
    setComponentMetadata(target, def);
    setInjectableMetadata(target);
  };
}
