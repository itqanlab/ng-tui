import { MicrosyntaxParser } from './microsyntax-parser.js';
import type { NgForContext } from './microsyntax-parser.js';

/**
 * Compiler-side handler for *ngFor.
 * Parses the microsyntax and provides context for the runtime directive.
 */
export class NgForCompiler {
  private parser = new MicrosyntaxParser();

  compile(expression: string): NgForContext {
    return this.parser.parseNgFor(expression);
  }
}
