/**
 * Runtime NgIf directive.
 * Creates or destroys a view based on a boolean condition.
 */
export class NgIf {
  private condition = false;

  setCondition(value: any): boolean {
    const previous = this.condition;
    this.condition = !!value;
    return previous !== this.condition;
  }

  shouldRender(): boolean {
    return this.condition;
  }
}
