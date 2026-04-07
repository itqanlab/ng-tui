import type { KeyEvent } from '../events/event-types.js';
import type { ComponentView } from './component-renderer.js';

/**
 * Dispatches keyboard events to all registered handlers in the component tree.
 * V1: simple broadcast model — no focus system.
 */
export function dispatchKeyEvent(rootView: ComponentView, event: KeyEvent): void {
  walkViewTree(rootView, (view) => {
    // Dispatch to 'keypress' handlers
    const keypressHandlers = view.eventHandlers.get('keypress');
    if (keypressHandlers) {
      for (const handler of keypressHandlers) {
        handler(event);
      }
    }

    // Dispatch 'submit' on Enter key
    if (event.key === 'return') {
      const submitHandlers = view.eventHandlers.get('submit');
      if (submitHandlers) {
        for (const handler of submitHandlers) {
          handler(event);
        }
      }
    }
  });
}

function walkViewTree(view: ComponentView, visitor: (view: ComponentView) => void): void {
  visitor(view);
  for (const child of view.childViews) {
    walkViewTree(child, visitor);
  }
}
