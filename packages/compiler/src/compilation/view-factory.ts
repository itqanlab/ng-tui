import type { CompiledTemplate } from './compiled-template.js';

/**
 * Creates and manages component views from compiled templates.
 * Each view instance represents a live rendering of a template with a context.
 */
export interface ViewRef {
  /** The compiled template */
  template: CompiledTemplate;
  /** The component context for expression evaluation */
  context: Record<string, any>;
  /** Whether the view needs re-rendering */
  dirty: boolean;
  /** Mark the view as needing re-render */
  markDirty(): void;
  /** Destroy the view and clean up */
  destroy(): void;
}

export class ViewFactory {
  createView(template: CompiledTemplate, context: Record<string, any>): ViewRef {
    return {
      template,
      context,
      dirty: true,
      markDirty() {
        this.dirty = true;
      },
      destroy() {
        this.dirty = false;
      },
    };
  }
}
