import { Pipe, type PipeTransform } from '@ng-tui/core';

@Pipe({ name: 'titlecase' })
export class TitleCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
