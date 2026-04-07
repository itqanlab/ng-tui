import { YogaAdapter, type ComputedLayout } from './yoga-adapter.js';
import type { LayoutProps } from './layout-props.js';

/**
 * A node in the layout tree — maps component tree to Yoga nodes.
 */
export interface LayoutNode {
  id: string;
  props: LayoutProps;
  children: LayoutNode[];
  yogaNode?: any;
  computed?: ComputedLayout;
}

/**
 * Converts a component tree into Yoga layout nodes and computes positions.
 */
export class LayoutTree {
  constructor(private adapter: YogaAdapter) {}

  compute(root: LayoutNode, width: number, height: number): void {
    this.buildYogaTree(root);
    if (root.yogaNode) {
      this.adapter.calculateLayout(root.yogaNode, width, height);
      this.readComputedLayouts(root);
      this.adapter.freeNode(root.yogaNode);
    }
  }

  private buildYogaTree(node: LayoutNode): void {
    node.yogaNode = this.adapter.createNode();
    this.adapter.applyProps(node.yogaNode, node.props);

    for (let i = 0; i < node.children.length; i++) {
      this.buildYogaTree(node.children[i]);
      node.yogaNode.insertChild(node.children[i].yogaNode, i);
    }
  }

  private readComputedLayouts(node: LayoutNode): void {
    if (node.yogaNode) {
      node.computed = this.adapter.getComputedLayout(node.yogaNode);
    }
    for (const child of node.children) {
      this.readComputedLayouts(child);
    }
  }
}
