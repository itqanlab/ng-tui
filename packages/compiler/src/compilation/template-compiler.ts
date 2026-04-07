import type { TemplateParser } from '../parser/template-parser.js';
import { AngularParserAdapter } from '../parser/angular-parser-adapter.js';
import type { CompiledTemplate } from './compiled-template.js';
import type { TNode } from '../parser/ast.js';

/**
 * Main orchestrator: takes a template string and produces a CompiledTemplate.
 * Parse once, evaluate many.
 */
export class TemplateCompiler {
  private parser: TemplateParser;

  constructor(parser?: TemplateParser) {
    this.parser = parser || new AngularParserAdapter();
  }

  compile(template: string): CompiledTemplate {
    const { nodes, errors } = this.parser.parse(template);

    if (errors.length > 0) {
      const messages = errors.map((e) => e.message).join(', ');
      throw new Error(`Template compilation errors: ${messages}`);
    }

    return {
      nodes,
      hasInterpolations: this.checkInterpolations(nodes),
      hasStructuralDirectives: this.checkStructuralDirectives(nodes),
    };
  }

  private checkInterpolations(nodes: TNode[]): boolean {
    for (const node of nodes) {
      if (node.type === 'bound_text') return true;
      if (node.type === 'element') {
        if (this.checkInterpolations((node as any).children)) return true;
      }
      if (node.type === 'template') {
        if (this.checkInterpolations((node as any).children)) return true;
      }
    }
    return false;
  }

  private checkStructuralDirectives(nodes: TNode[]): boolean {
    for (const node of nodes) {
      if (node.type === 'template') return true;
      if (node.type === 'element') {
        if (this.checkStructuralDirectives((node as any).children)) return true;
      }
    }
    return false;
  }
}
