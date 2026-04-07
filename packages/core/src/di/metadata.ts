import 'reflect-metadata';

const INJECTABLE_KEY = 'ng-tui:injectable';
const INJECT_KEY = 'ng-tui:inject';
const COMPONENT_KEY = 'ng-tui:component';
const INPUT_KEY = 'ng-tui:input';
const OUTPUT_KEY = 'ng-tui:output';
const PIPE_KEY = 'ng-tui:pipe';

/**
 * Internal metadata helpers.
 * All reflect-metadata access is isolated here for future TC39 decorator migration.
 */

export function setInjectableMetadata(target: object): void {
  Reflect.defineMetadata(INJECTABLE_KEY, true, target);
}

export function getInjectableMetadata(target: object): boolean {
  return Reflect.getMetadata(INJECTABLE_KEY, target) === true;
}

export function getParamTypes(target: object): any[] {
  return Reflect.getMetadata('design:paramtypes', target) || [];
}

export function setInjectToken(target: object, parameterIndex: number, token: any): void {
  const existing: Map<number, any> = Reflect.getOwnMetadata(INJECT_KEY, target) || new Map();
  existing.set(parameterIndex, token);
  Reflect.defineMetadata(INJECT_KEY, existing, target);
}

export function getInjectTokens(target: object): Map<number, any> {
  return Reflect.getOwnMetadata(INJECT_KEY, target) || new Map();
}

export function setComponentMetadata(target: object, def: any): void {
  Reflect.defineMetadata(COMPONENT_KEY, def, target);
}

export function getComponentMetadata(target: object): any | undefined {
  return Reflect.getMetadata(COMPONENT_KEY, target);
}

export function setInputMetadata(target: object, propertyKey: string, alias?: string): void {
  const inputs: Map<string, string> = Reflect.getOwnMetadata(INPUT_KEY, target.constructor) || new Map();
  inputs.set(propertyKey, alias || propertyKey);
  Reflect.defineMetadata(INPUT_KEY, inputs, target.constructor);
}

export function getInputMetadata(target: object): Map<string, string> {
  return Reflect.getMetadata(INPUT_KEY, target) || new Map();
}

export function setOutputMetadata(target: object, propertyKey: string, alias?: string): void {
  const outputs: Map<string, string> = Reflect.getOwnMetadata(OUTPUT_KEY, target.constructor) || new Map();
  outputs.set(propertyKey, alias || propertyKey);
  Reflect.defineMetadata(OUTPUT_KEY, outputs, target.constructor);
}

export function getOutputMetadata(target: object): Map<string, string> {
  return Reflect.getMetadata(OUTPUT_KEY, target) || new Map();
}

export function setPipeMetadata(target: object, def: { name: string }): void {
  Reflect.defineMetadata(PIPE_KEY, def, target);
}

export function getPipeMetadata(target: object): { name: string } | undefined {
  return Reflect.getMetadata(PIPE_KEY, target);
}
