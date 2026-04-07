import { Pipe, type PipeTransform } from '@ng-tui/core';

/**
 * Terminal-specific pipe: applies ANSI styling.
 * Usage: {{ text | ansi:'bold,red' }}
 *
 * Note: Actual ANSI codes will be applied by the platform-terminal renderer.
 * This pipe stores style metadata for the renderer to process.
 */
@Pipe({ name: 'ansi' })
export class AnsiPipe implements PipeTransform {
  transform(value: string, styles: string): { text: string; styles: string[] } {
    return {
      text: value ?? '',
      styles: styles.split(',').map((s) => s.trim()),
    };
  }
}
