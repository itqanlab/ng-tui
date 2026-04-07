import { Pipe, type PipeTransform } from '@ng-tui/core';

@Pipe({ name: 'lowercase' })
export class LowercasePipe implements PipeTransform {
  transform(value: string): string {
    return value?.toLowerCase() ?? '';
  }
}
