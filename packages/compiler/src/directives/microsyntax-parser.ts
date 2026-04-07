import type { TVariable } from '../parser/ast.js';

export interface NgForContext {
  itemName: string;
  iterableName: string;
  variables: TVariable[];
}

export interface NgIfContext {
  expression: string;
  elseExpression?: string;
}

/**
 * Parses Angular structural directive microsyntax.
 *
 * *ngFor="let item of items; let i = index; trackBy: trackFn"
 * *ngIf="condition; else elseBlock"
 */
export class MicrosyntaxParser {
  parseNgFor(expression: string): NgForContext {
    const variables: TVariable[] = [];
    let itemName = '';
    let iterableName = '';

    const parts = expression.split(';').map((s) => s.trim());

    for (const part of parts) {
      // "let item of items"
      const ofMatch = part.match(/^let\s+(\w+)\s+of\s+(.+)$/);
      if (ofMatch) {
        itemName = ofMatch[1];
        iterableName = ofMatch[2].trim();
        variables.push({ name: itemName });
        continue;
      }

      // "let i = index"
      const letMatch = part.match(/^let\s+(\w+)\s*=\s*(\w+)$/);
      if (letMatch) {
        variables.push({ name: letMatch[1], value: letMatch[2] });
        continue;
      }

      // "trackBy: trackFn"
      const trackByMatch = part.match(/^trackBy\s*:\s*(.+)$/);
      if (trackByMatch) {
        variables.push({ name: '$trackBy', value: trackByMatch[1].trim() });
      }
    }

    return { itemName, iterableName, variables };
  }

  parseNgIf(expression: string): NgIfContext {
    const parts = expression.split(';').map((s) => s.trim());

    return {
      expression: parts[0],
      elseExpression: parts.find((p) => p.startsWith('else '))?.replace('else ', '').trim(),
    };
  }
}
