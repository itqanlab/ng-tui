import { parse as angularParse } from 'angular-html-parser';
import type { TemplateParser, TemplateParseResult, TemplateParseError } from './template-parser.js';
import type {
  TNode,
  TElement,
  TText,
  TBoundText,
  TBoundAttribute,
  TBoundEvent,
  TAttribute,
  TInterpolation,
  TTemplate,
  TVariable,
} from './ast.js';

/**
 * TemplateParser implementation using angular-html-parser.
 * Wraps the Prettier team's standalone extraction of Angular's HTML parser.
 */
export class AngularParserAdapter implements TemplateParser {
  parse(template: string): TemplateParseResult {
    const errors: TemplateParseError[] = [];

    try {
      const result = angularParse(template, {
        canSelfClose: true,
        isTagNameCaseSensitive: true,
      });

      if (result.errors && result.errors.length > 0) {
        for (const err of result.errors) {
          errors.push({ message: err.msg });
        }
      }

      const nodes = this.transformNodes(result.rootNodes);
      return { nodes, errors };
    } catch (err: any) {
      errors.push({ message: err.message || 'Template parse error' });
      return { nodes: [], errors };
    }
  }

  private transformNodes(nodes: any[]): TNode[] {
    const result: TNode[] = [];

    for (const node of nodes) {
      const transformed = this.transformNode(node);
      if (transformed) {
        result.push(transformed);
      }
    }

    return result;
  }

  private transformNode(node: any): TNode | null {
    // Text node
    if (node.type === 'text') {
      const value = node.value as string;

      // Check for interpolations
      const interpolations = this.extractInterpolations(value);
      if (interpolations.length > 0) {
        return {
          type: 'bound_text',
          expressions: interpolations,
        } as TBoundText;
      }

      // Skip whitespace-only text nodes
      if (value.trim() === '') return null;

      return { type: 'text', value } as TText;
    }

    // Element node
    if (node.type === 'element') {
      return this.transformElement(node);
    }

    return null;
  }

  private transformElement(node: any): TNode {
    const attrs = (node.attrs || []) as Array<{ name: string; value: string }>;

    // Check for structural directive (*ngFor, *ngIf)
    const structuralAttr = attrs.find((a: any) => a.name.startsWith('*'));
    if (structuralAttr) {
      return this.transformStructuralDirective(node, structuralAttr);
    }

    const inputs: TBoundAttribute[] = [];
    const outputs: TBoundEvent[] = [];
    const staticAttrs: TAttribute[] = [];

    for (const attr of attrs) {
      if (attr.name.startsWith('[') && attr.name.endsWith(']')) {
        // Property binding: [prop]="expr"
        inputs.push({
          name: attr.name.slice(1, -1),
          expression: attr.value,
        });
      } else if (attr.name.startsWith('(') && attr.name.endsWith(')')) {
        // Event binding: (event)="handler"
        outputs.push({
          name: attr.name.slice(1, -1),
          handler: attr.value,
        });
      } else {
        staticAttrs.push({ name: attr.name, value: attr.value });
      }
    }

    return {
      type: 'element',
      name: node.name,
      attributes: staticAttrs,
      children: this.transformNodes(node.children || []),
      inputs,
      outputs,
    } as TElement;
  }

  private transformStructuralDirective(node: any, attr: { name: string; value: string }): TTemplate {
    const directive = attr.name.slice(1); // remove *
    const expression = attr.value;
    const variables: TVariable[] = [];

    // Parse microsyntax for *ngFor: "let item of items; let i = index"
    if (directive === 'ngFor') {
      const parts = expression.split(';').map((s: string) => s.trim());
      for (const part of parts) {
        const letMatch = part.match(/^let\s+(\w+)\s+of\s+(.+)$/);
        if (letMatch) {
          variables.push({ name: letMatch[1] });
        }
        const indexMatch = part.match(/^let\s+(\w+)\s*=\s*(\w+)$/);
        if (indexMatch) {
          variables.push({ name: indexMatch[1], value: indexMatch[2] });
        }
      }
    }

    // Filter out the structural directive attr from child attrs
    const filteredAttrs = (node.attrs || []).filter((a: any) => a !== attr);

    return {
      type: 'template',
      directive,
      expression,
      variables,
      children: [{
        type: 'element',
        name: node.name,
        attributes: filteredAttrs.filter((a: any) =>
          !a.name.startsWith('[') && !a.name.startsWith('(')
        ),
        children: this.transformNodes(node.children || []),
        inputs: filteredAttrs
          .filter((a: any) => a.name.startsWith('[') && a.name.endsWith(']'))
          .map((a: any) => ({ name: a.name.slice(1, -1), expression: a.value })),
        outputs: filteredAttrs
          .filter((a: any) => a.name.startsWith('(') && a.name.endsWith(')'))
          .map((a: any) => ({ name: a.name.slice(1, -1), handler: a.value })),
      } as TElement],
    };
  }

  private extractInterpolations(text: string): TInterpolation[] {
    const interpolations: TInterpolation[] = [];
    const regex = /\{\{\s*(.*?)\s*\}\}/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      interpolations.push({
        expression: match[1],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return interpolations;
  }
}
