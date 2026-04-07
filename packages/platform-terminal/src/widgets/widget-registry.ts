/**
 * Maps element names to widget render functions.
 */
export type WidgetRenderFn = (props: Record<string, any>, children: any[]) => any;

export class WidgetRegistry {
  private widgets = new Map<string, WidgetRenderFn>();

  register(name: string, renderFn: WidgetRenderFn): void {
    this.widgets.set(name, renderFn);
  }

  get(name: string): WidgetRenderFn | undefined {
    return this.widgets.get(name);
  }

  has(name: string): boolean {
    return this.widgets.has(name);
  }

  getAll(): Map<string, WidgetRenderFn> {
    return new Map(this.widgets);
  }
}
