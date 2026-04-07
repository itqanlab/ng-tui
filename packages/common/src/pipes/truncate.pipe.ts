import { Pipe, type PipeTransform } from '@ng-tui/core';

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxLength = 40, suffix = '...'): string {
    if (!value || value.length <= maxLength) return value ?? '';
    return value.slice(0, maxLength - suffix.length) + suffix;
  }
}
