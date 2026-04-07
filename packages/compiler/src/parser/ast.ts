/**
 * Template AST node types produced by the template parser.
 */

export interface TNode {
  type: string;
}

/** A terminal element like <box>, <text>, <input> */
export interface TElement extends TNode {
  type: 'element';
  name: string;
  attributes: TAttribute[];
  children: TNode[];
  inputs: TBoundAttribute[];
  outputs: TBoundEvent[];
}

/** A text node, may contain interpolations */
export interface TText extends TNode {
  type: 'text';
  value: string;
}

/** Text with {{ expression }} interpolations */
export interface TBoundText extends TNode {
  type: 'bound_text';
  rawText: string;
  expressions: TInterpolation[];
}

/** A single {{ expression }} within text */
export interface TInterpolation {
  expression: string;
  start: number;
  end: number;
}

/** A static attribute: name="value" */
export interface TAttribute {
  name: string;
  value: string;
}

/** A property binding: [prop]="expression" */
export interface TBoundAttribute {
  name: string;
  expression: string;
}

/** An event binding: (event)="handler($event)" */
export interface TBoundEvent {
  name: string;
  handler: string;
}

/** A structural directive template: *ngFor, *ngIf */
export interface TTemplate extends TNode {
  type: 'template';
  directive: string;
  expression: string;
  variables: TVariable[];
  children: TNode[];
}

/** A template variable: let item, let i = index */
export interface TVariable {
  name: string;
  value?: string;
}
