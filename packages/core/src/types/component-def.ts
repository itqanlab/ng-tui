import type { Type } from './type.js';

/**
 * Parsed metadata from @Component decorator.
 */
export interface ComponentDef {
  selector: string;
  template: string;
  styles?: Record<string, string>;
  providers?: any[];
  components?: Type[];
}
