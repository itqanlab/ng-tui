import {
  AnsiPipe,
  DatePipe,
  JsonPipe,
  LowercasePipe,
  SlicePipe,
  TitleCasePipe,
  TruncatePipe,
  UppercasePipe,
} from '@ng-tui/common';
import type { ExpressionEvaluator } from '@ng-tui/compiler';

/**
 * Registers all built-in pipes from @ng-tui/common on an ExpressionEvaluator.
 */
export function registerCommonPipes(evaluator: ExpressionEvaluator): void {
  const pipes: Array<{ name: string; pipe: { transform(value: any, ...args: any[]): any } }> = [
    { name: 'uppercase', pipe: new UppercasePipe() },
    { name: 'lowercase', pipe: new LowercasePipe() },
    { name: 'titlecase', pipe: new TitleCasePipe() },
    { name: 'date', pipe: new DatePipe() },
    { name: 'json', pipe: new JsonPipe() },
    { name: 'slice', pipe: new SlicePipe() },
    { name: 'truncate', pipe: new TruncatePipe() },
    { name: 'ansi', pipe: new AnsiPipe() },
  ];

  for (const { name, pipe } of pipes) {
    evaluator.registerPipe(name, (value: any, ...args: any[]) => pipe.transform(value, ...args));
  }
}
