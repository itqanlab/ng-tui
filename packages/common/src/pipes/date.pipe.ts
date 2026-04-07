import { Pipe, type PipeTransform } from '@ng-tui/core';

@Pipe({ name: 'date' })
export class DatePipe implements PipeTransform {
  transform(value: Date | string | number, format = 'short'): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    switch (format) {
      case 'short':
        return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'medium':
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      case 'long':
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      case 'time':
        return date.toLocaleTimeString();
      case 'iso':
        return date.toISOString();
      default:
        return date.toLocaleDateString();
    }
  }
}
