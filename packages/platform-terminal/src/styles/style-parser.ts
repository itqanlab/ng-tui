import type { Cell } from '../renderer/cell.js';

/**
 * Parses [style.X]="value" bindings into Cell style properties.
 */
export function parseStyleBindings(bindings: Record<string, any>): Partial<Cell> {
  const style: Partial<Cell> = {};

  for (const [key, value] of Object.entries(bindings)) {
    if (!key.startsWith('style.')) continue;
    const prop = key.slice(6); // remove 'style.'

    switch (prop) {
      case 'color':
      case 'fg':
        style.fg = String(value);
        break;
      case 'backgroundColor':
      case 'bg':
        style.bg = String(value);
        break;
      case 'bold':
        style.bold = !!value;
        break;
      case 'italic':
        style.italic = !!value;
        break;
      case 'underline':
        style.underline = !!value;
        break;
      case 'dim':
        style.dim = !!value;
        break;
      case 'strikethrough':
        style.strikethrough = !!value;
        break;
    }
  }

  return style;
}
