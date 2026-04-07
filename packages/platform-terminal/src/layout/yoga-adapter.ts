import type { LayoutProps } from './layout-props.js';

/**
 * Wraps yoga-layout WASM bindings.
 * Isolates the Yoga dependency behind this adapter for swappability.
 *
 * Note: Yoga initialization requires top-level await or async initialization.
 * This adapter lazily initializes Yoga on first use.
 */
export interface ComputedLayout {
  left: number;
  top: number;
  width: number;
  height: number;
}

export class YogaAdapter {
  private yoga: any = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    // Dynamic import for WASM module
    const yogaModule = await import('yoga-layout');
    this.yoga = yogaModule.default ?? yogaModule;
    this.initialized = true;
  }

  createNode(): any {
    this.ensureInitialized();
    return this.yoga.Node.create();
  }

  applyProps(node: any, props: LayoutProps): void {
    this.ensureInitialized();
    const Y = this.yoga;

    if (props.width !== undefined) node.setWidth(props.width);
    if (props.height !== undefined) node.setHeight(props.height);
    if (props.minWidth !== undefined) node.setMinWidth(props.minWidth);
    if (props.minHeight !== undefined) node.setMinHeight(props.minHeight);
    if (props.maxWidth !== undefined) node.setMaxWidth(props.maxWidth);
    if (props.maxHeight !== undefined) node.setMaxHeight(props.maxHeight);
    if (props.flexGrow !== undefined) node.setFlexGrow(props.flexGrow);
    if (props.flexShrink !== undefined) node.setFlexShrink(props.flexShrink);
    if (props.gap !== undefined) node.setGap(Y.Edge.All, props.gap);

    if (props.flexDirection) {
      const dirMap: Record<string, number> = {
        'row': Y.FlexDirection.Row,
        'column': Y.FlexDirection.Column,
        'row-reverse': Y.FlexDirection.RowReverse,
        'column-reverse': Y.FlexDirection.ColumnReverse,
      };
      node.setFlexDirection(dirMap[props.flexDirection] ?? Y.FlexDirection.Column);
    }

    if (props.padding !== undefined) node.setPadding(Y.Edge.All, props.padding);
    if (props.paddingTop !== undefined) node.setPadding(Y.Edge.Top, props.paddingTop);
    if (props.paddingRight !== undefined) node.setPadding(Y.Edge.Right, props.paddingRight);
    if (props.paddingBottom !== undefined) node.setPadding(Y.Edge.Bottom, props.paddingBottom);
    if (props.paddingLeft !== undefined) node.setPadding(Y.Edge.Left, props.paddingLeft);

    if (props.margin !== undefined) node.setMargin(Y.Edge.All, props.margin);
    if (props.marginTop !== undefined) node.setMargin(Y.Edge.Top, props.marginTop);
    if (props.marginRight !== undefined) node.setMargin(Y.Edge.Right, props.marginRight);
    if (props.marginBottom !== undefined) node.setMargin(Y.Edge.Bottom, props.marginBottom);
    if (props.marginLeft !== undefined) node.setMargin(Y.Edge.Left, props.marginLeft);
  }

  calculateLayout(node: any, width: number, height: number): void {
    this.ensureInitialized();
    node.calculateLayout(width, height);
  }

  getComputedLayout(node: any): ComputedLayout {
    return {
      left: node.getComputedLeft(),
      top: node.getComputedTop(),
      width: node.getComputedWidth(),
      height: node.getComputedHeight(),
    };
  }

  freeNode(node: any): void {
    node.freeRecursive();
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('YogaAdapter not initialized. Call await adapter.init() first.');
    }
  }
}
