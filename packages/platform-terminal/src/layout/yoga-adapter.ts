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

    if (props.width !== undefined) this.setDimension(node, 'setWidth', 'setWidthPercent', props.width);
    if (props.height !== undefined) this.setDimension(node, 'setHeight', 'setHeightPercent', props.height);
    if (props.minWidth !== undefined) node.setMinWidth(props.minWidth);
    if (props.minHeight !== undefined) node.setMinHeight(props.minHeight);
    if (props.maxWidth !== undefined) node.setMaxWidth(props.maxWidth);
    if (props.maxHeight !== undefined) node.setMaxHeight(props.maxHeight);
    if (props.flexGrow !== undefined) node.setFlexGrow(props.flexGrow);
    if (props.flexShrink !== undefined) node.setFlexShrink(props.flexShrink);
    if (props.gap !== undefined) node.setGap(Y.EDGE_ALL, props.gap);

    if (props.flexDirection) {
      const dirMap: Record<string, number> = {
        'row': Y.FLEX_DIRECTION_ROW,
        'column': Y.FLEX_DIRECTION_COLUMN,
        'row-reverse': Y.FLEX_DIRECTION_ROW_REVERSE,
        'column-reverse': Y.FLEX_DIRECTION_COLUMN_REVERSE,
      };
      node.setFlexDirection(dirMap[props.flexDirection] ?? Y.FLEX_DIRECTION_COLUMN);
    }

    if (props.padding !== undefined) node.setPadding(Y.EDGE_ALL, props.padding);
    if (props.paddingTop !== undefined) node.setPadding(Y.EDGE_TOP, props.paddingTop);
    if (props.paddingRight !== undefined) node.setPadding(Y.EDGE_RIGHT, props.paddingRight);
    if (props.paddingBottom !== undefined) node.setPadding(Y.EDGE_BOTTOM, props.paddingBottom);
    if (props.paddingLeft !== undefined) node.setPadding(Y.EDGE_LEFT, props.paddingLeft);

    if (props.margin !== undefined) node.setMargin(Y.EDGE_ALL, props.margin);
    if (props.marginTop !== undefined) node.setMargin(Y.EDGE_TOP, props.marginTop);
    if (props.marginRight !== undefined) node.setMargin(Y.EDGE_RIGHT, props.marginRight);
    if (props.marginBottom !== undefined) node.setMargin(Y.EDGE_BOTTOM, props.marginBottom);
    if (props.marginLeft !== undefined) node.setMargin(Y.EDGE_LEFT, props.marginLeft);
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

  private setDimension(node: any, setter: string, percentSetter: string, value: any): void {
    if (typeof value === 'string' && value.endsWith('%')) {
      node[percentSetter](parseFloat(value));
    } else {
      node[setter](typeof value === 'number' ? value : parseFloat(value));
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('YogaAdapter not initialized. Call await adapter.init() first.');
    }
  }
}
