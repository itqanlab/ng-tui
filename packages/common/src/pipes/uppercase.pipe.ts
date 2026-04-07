import { Pipe, type PipeTransform } from '@ng-tui/core';

@Pipe({ name: 'uppercase' })
export class UppercasePipe implements PipeTransform {
  transform(value: string): string {
    return value?.toUpperCase() ?? '';
  }
}
