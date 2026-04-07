/**
 * Runtime NgStyle directive.
 * Applies dynamic styles to a widget.
 */
export class NgStyle {
  private styles: Record<string, any> = {};

  setStyles(styles: Record<string, any>): void {
    this.styles = styles;
  }

  getStyles(): Record<string, any> {
    return this.styles;
  }
}
