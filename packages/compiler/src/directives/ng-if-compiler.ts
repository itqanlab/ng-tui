import { MicrosyntaxParser } from './microsyntax-parser.js';
import type { NgIfContext } from './microsyntax-parser.js';

/**
 * Compiler-side handler for *ngIf.
 */
export class NgIfCompiler {
  private parser = new MicrosyntaxParser();

  compile(expression: string): NgIfContext {
    return this.parser.parseNgIf(expression);
  }
}
