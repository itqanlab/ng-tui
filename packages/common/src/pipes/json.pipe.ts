import { Pipe, type PipeTransform } from '@ng-tui/core';

@Pipe({ name: 'json' })
export class JsonPipe implements PipeTransform {
  transform(value: any, indent = 2): string {
    return JSON.stringify(value, null, indent);
  }
}
