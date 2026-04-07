import type { PipeTransform } from '@ng-tui/core';

/**
 * Registry that maps pipe names to their transform functions.
 */
export class PipeRegistry {
  private pipes = new Map<string, PipeTransform>();

  register(name: string, pipe: PipeTransform): void {
    this.pipes.set(name, pipe);
  }

  get(name: string): PipeTransform | undefined {
    return this.pipes.get(name);
  }

  has(name: string): boolean {
    return this.pipes.has(name);
  }

  getTransformFn(name: string): ((value: any, ...args: any[]) => any) | undefined {
    const pipe = this.pipes.get(name);
    if (!pipe) return undefined;
    return (value: any, ...args: any[]) => pipe.transform(value, ...args);
  }
}
