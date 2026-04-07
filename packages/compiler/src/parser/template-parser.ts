import type { TNode } from './ast.js';

/**
 * Abstraction layer for template parsing.
 * Allows swapping the underlying parser (angular-html-parser today, custom later).
 */
export interface TemplateParser {
  parse(template: string): TemplateParseResult;
}

export interface TemplateParseResult {
  nodes: TNode[];
  errors: TemplateParseError[];
}

export interface TemplateParseError {
  message: string;
  line?: number;
  column?: number;
}
