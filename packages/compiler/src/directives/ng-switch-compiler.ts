/**
 * Compiler-side handler for *ngSwitch.
 */
export class NgSwitchCompiler {
  compile(expression: string): { expression: string } {
    return { expression: expression.trim() };
  }
}
