import { Pipe, type PipeTransform } from '@ng-tui/core';

@Pipe({ name: 'slice' })
export class SlicePipe implements PipeTransform {
  transform(value: any[] | string, start: number, end?: number): any[] | string {
    if (value == null) return value;
    return value.slice(start, end);
  }
}
