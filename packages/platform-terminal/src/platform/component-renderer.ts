import { NgForOf, NgIf } from '@ng-tui/common';
import {
  type CompiledTemplate,
  ExpressionEvaluator,
  ExpressionParser,
  MicrosyntaxParser,
  type TBoundText,
  type TElement,
  type TNode,
  type TTemplate,
  type TText,
  TemplateCompiler,
  ViewFactory,
  type ViewRef,
  resolveEventBindings,
  resolveInterpolation,
  resolvePropertyBindings,
} from '@ng-tui/compiler';
import {
  type ComponentDef,
  Injector,
  type Type,
  getComponentMetadata,
  getInputMetadata,
} from '@ng-tui/core';
import type { LayoutProps } from '../layout/layout-props.js';
import type { LayoutNode } from '../layout/layout-tree.js';
import { LayoutTree } from '../layout/layout-tree.js';
import type { ComputedLayout, YogaAdapter } from '../layout/yoga-adapter.js';
import type { ScreenBuffer } from '../renderer/screen-buffer.js';
import {
  renderBox,
  renderInput,
  renderList,
  renderProgress,
  renderSelect,
  renderSpinner,
  renderTable,
  renderText,
} from '../widgets/index.js';
import { registerCommonPipes } from './pipe-setup.js';

/**
 * A live view of a rendered component.
 */
export interface ComponentView {
  componentClass: Type;
  instance: any;
  compiledTemplate: CompiledTemplate;
  viewRef: ViewRef;
  childViews: ComponentView[];
  eventHandlers: Map<string, ((...args: any[]) => void)[]>;
}

/**
 * Extended LayoutNode carrying widget rendering metadata.
 */
interface RenderNode extends LayoutNode {
  _widgetType: string;
  _widgetProps: Record<string, any>;
  _textContent?: string;
}

const LAYOUT_PROP_NAMES = new Set([
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'flexDirection',
  'justifyContent',
  'alignItems',
  'alignSelf',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'gap',
]);

const NUMERIC_LAYOUT_PROPS = new Set([
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'flexGrow',
  'flexShrink',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'gap',
]);

/**
 * Orchestrates template compilation, expression evaluation, layout computation,
 * and widget rendering for the ng-tui component tree.
 */
export class ComponentRenderer {
  private templateCache = new WeakMap<Type, CompiledTemplate>();
  private expressionCache = new Map<string, any>();
  private compiler = new TemplateCompiler();
  private viewFactory = new ViewFactory();
  private parser = new ExpressionParser();
  private evaluator = new ExpressionEvaluator();
  private microsyntax = new MicrosyntaxParser();
  private yoga: YogaAdapter;
  private layoutTree: LayoutTree;
  private nodeCounter = 0;

  constructor(yoga: YogaAdapter) {
    this.yoga = yoga;
    this.layoutTree = new LayoutTree(yoga);
    registerCommonPipes(this.evaluator);
  }

  /**
   * Build a ComponentView from a component class and its instance.
   */
  buildComponentView(componentClass: Type, instance: any, injector: Injector): ComponentView {
    const metadata = getComponentMetadata(componentClass) as ComponentDef | undefined;
    if (!metadata?.template) {
      throw new Error(`Component ${componentClass.name} has no template`);
    }

    let compiled = this.templateCache.get(componentClass);
    if (!compiled) {
      compiled = this.compiler.compile(metadata.template);
      this.templateCache.set(componentClass, compiled);
    }

    const viewRef = this.viewFactory.createView(compiled, instance);

    return {
      componentClass,
      instance,
      compiledTemplate: compiled,
      viewRef,
      childViews: [],
      eventHandlers: new Map(),
    };
  }

  /**
   * Render a component view into a ScreenBuffer.
   */
  renderToBuffer(view: ComponentView, buffer: ScreenBuffer, width: number, height: number): void {
    this.nodeCounter = 0;
    view.eventHandlers.clear();
    view.childViews = [];

    const metadata = getComponentMetadata(view.componentClass) as ComponentDef;
    const selectorMap = this.buildSelectorMap(metadata.components);

    const rootLayout = this.buildLayoutTree(
      view.compiledTemplate.nodes,
      view.instance,
      view,
      selectorMap,
      view.viewRef.context,
    );

    // Wrap in a root container
    const root: RenderNode = {
      id: this.nextId(),
      props: { width, height, flexDirection: 'column' },
      children: rootLayout,
      _widgetType: 'root',
      _widgetProps: {},
    };

    this.layoutTree.compute(root, width, height);
    this.renderLayoutTree(root, buffer);
  }

  private buildLayoutTree(
    nodes: TNode[],
    context: Record<string, any>,
    view: ComponentView,
    selectorMap: Map<string, Type>,
    parentContext?: Record<string, any>,
  ): RenderNode[] {
    const result: RenderNode[] = [];

    for (const node of nodes) {
      const rendered = this.processNode(node, context, view, selectorMap);
      if (rendered) {
        if (Array.isArray(rendered)) {
          result.push(...rendered);
        } else {
          result.push(rendered);
        }
      }
    }

    return result;
  }

  private processNode(
    node: TNode,
    context: Record<string, any>,
    view: ComponentView,
    selectorMap: Map<string, Type>,
  ): RenderNode | RenderNode[] | null {
    switch (node.type) {
      case 'text':
        return this.processText(node as TText);
      case 'bound_text':
        return this.processBoundText(node as TBoundText, context);
      case 'element':
        return this.processElement(node as TElement, context, view, selectorMap);
      case 'template':
        return this.processTemplate(node as TTemplate, context, view, selectorMap);
      default:
        return null;
    }
  }

  private processText(node: TText): RenderNode {
    const content = node.value.trim();
    if (!content) return null as any;

    return {
      id: this.nextId(),
      props: {},
      children: [],
      _widgetType: 'text',
      _widgetProps: { content },
    };
  }

  private processBoundText(node: TBoundText, context: Record<string, any>): RenderNode {
    const evalFn = (expr: string) => this.evaluateExpression(expr, context);
    const content = resolveInterpolation(node.rawText, node.expressions, evalFn);
    const trimmed = content.trim();
    if (!trimmed) return null as any;

    return {
      id: this.nextId(),
      props: {},
      children: [],
      _widgetType: 'text',
      _widgetProps: { content: trimmed },
    };
  }

  private processElement(
    node: TElement,
    context: Record<string, any>,
    view: ComponentView,
    selectorMap: Map<string, Type>,
  ): RenderNode | null {
    // Check if this is a child component
    const childClass = selectorMap.get(node.name);
    if (childClass) {
      return this.processChildComponent(node, childClass, context, view, selectorMap);
    }

    // Resolve bindings
    const evalFn = (expr: string) => this.evaluateExpression(expr, context);
    const resolvedBindings = resolvePropertyBindings(node.inputs, evalFn);

    // Merge static attributes
    const allProps: Record<string, any> = {};
    for (const attr of node.attributes) {
      allProps[attr.name] = attr.value;
    }
    for (const [key, val] of Object.entries(resolvedBindings)) {
      allProps[key] = val;
    }

    // Split into layout vs widget props
    const layoutProps: LayoutProps = {};
    const widgetProps: Record<string, any> = {};

    for (const [key, val] of Object.entries(allProps)) {
      if (LAYOUT_PROP_NAMES.has(key)) {
        (layoutProps as any)[key] = NUMERIC_LAYOUT_PROPS.has(key) ? toNumber(val) : val;
      } else {
        widgetProps[key] = val;
      }
    }

    // Collect event handlers
    if (node.outputs.length > 0) {
      const handlers = resolveEventBindings(node.outputs, context);
      for (const [eventName, handler] of Object.entries(handlers)) {
        const existing = view.eventHandlers.get(eventName) || [];
        existing.push(handler);
        view.eventHandlers.set(eventName, existing);
      }
    }

    // Build children
    const children = this.buildLayoutTree(node.children, context, view, selectorMap);

    // Resolve text content from children for text widget
    if (node.name === 'text' && !widgetProps.content) {
      const textParts: string[] = [];
      for (const child of node.children) {
        if (child.type === 'text') {
          textParts.push((child as TText).value.trim());
        } else if (child.type === 'bound_text') {
          const evalFnInner = (expr: string) => this.evaluateExpression(expr, context);
          const resolved = resolveInterpolation(
            (child as TBoundText).rawText,
            (child as TBoundText).expressions,
            evalFnInner,
          );
          textParts.push(resolved.trim());
        }
      }
      if (textParts.length > 0) {
        widgetProps.content = textParts.join('');
      }
    }

    // Auto-size leaf widgets based on content
    if (node.name === 'text') {
      const content = widgetProps.content || '';
      if (layoutProps.height === undefined) {
        layoutProps.height = Math.max(1, content.split('\n').length);
      }
      if (layoutProps.width === undefined) {
        const lines = content.split('\n');
        const maxLineLen = Math.max(...lines.map((l: string) => l.length));
        if (maxLineLen > 0) layoutProps.width = maxLineLen;
      }
    } else if (node.name === 'spinner') {
      if (layoutProps.height === undefined) layoutProps.height = 1;
      if (layoutProps.width === undefined) {
        const text = widgetProps.text || '';
        layoutProps.width = 2 + text.length; // spinner char + space + text
      }
    } else if (node.name === 'progress' || node.name === 'input') {
      if (layoutProps.height === undefined) layoutProps.height = 1;
    }

    // Boxes with borders need padding to prevent content overlap
    if (node.name === 'box' && widgetProps.borderStyle && widgetProps.borderStyle !== 'none') {
      if (layoutProps.paddingTop === undefined && layoutProps.padding === undefined) {
        layoutProps.paddingTop = (layoutProps.paddingTop as number | undefined) ?? 1;
      }
      if (layoutProps.paddingBottom === undefined && layoutProps.padding === undefined) {
        layoutProps.paddingBottom = (layoutProps.paddingBottom as number | undefined) ?? 1;
      }
      if (layoutProps.paddingLeft === undefined && layoutProps.padding === undefined) {
        layoutProps.paddingLeft = (layoutProps.paddingLeft as number | undefined) ?? 1;
      }
      if (layoutProps.paddingRight === undefined && layoutProps.padding === undefined) {
        layoutProps.paddingRight = (layoutProps.paddingRight as number | undefined) ?? 1;
      }
    }

    return {
      id: this.nextId(),
      props: layoutProps,
      children: node.name === 'text' ? [] : children,
      _widgetType: node.name,
      _widgetProps: widgetProps,
    };
  }

  private processChildComponent(
    node: TElement,
    childClass: Type,
    parentContext: Record<string, any>,
    parentView: ComponentView,
    selectorMap: Map<string, Type>,
  ): RenderNode | null {
    const metadata = getComponentMetadata(childClass) as ComponentDef | undefined;
    if (!metadata) return null;

    // Create child injector and instance
    const parentInjector = parentView.viewRef.context.__injector__ || new Injector();
    const childInjector = parentInjector.createChild(metadata.providers || []);
    const childInstance = childInjector.resolve(childClass);

    // Apply @Input bindings from parent template
    const inputMap = getInputMetadata(childClass);
    const evalFn = (expr: string) => this.evaluateExpression(expr, parentContext);
    const resolvedBindings = resolvePropertyBindings(node.inputs, evalFn);

    for (const [bindingName, value] of Object.entries(resolvedBindings)) {
      // Find the property name for this binding (might be aliased)
      for (const [propName, alias] of inputMap.entries()) {
        if (alias === bindingName || propName === bindingName) {
          childInstance[propName] = value;
        }
      }
      // Direct assignment if no alias found
      if (bindingName in childInstance) {
        childInstance[bindingName] = value;
      }
    }

    // Build child view
    const childView = this.buildComponentView(childClass, childInstance, childInjector);
    parentView.childViews.push(childView);

    const childSelectorMap = this.buildSelectorMap(metadata.components);
    const childNodes = this.buildLayoutTree(
      childView.compiledTemplate.nodes,
      childInstance,
      childView,
      childSelectorMap,
    );

    // Wrap child component output in a container node
    return {
      id: this.nextId(),
      props: {},
      children: childNodes,
      _widgetType: 'root',
      _widgetProps: {},
    };
  }

  private processTemplate(
    node: TTemplate,
    context: Record<string, any>,
    view: ComponentView,
    selectorMap: Map<string, Type>,
  ): RenderNode[] | null {
    switch (node.directive) {
      case 'ngFor':
        return this.processNgFor(node, context, view, selectorMap);
      case 'ngIf':
        return this.processNgIf(node, context, view, selectorMap);
      default:
        return null;
    }
  }

  private processNgFor(
    node: TTemplate,
    context: Record<string, any>,
    view: ComponentView,
    selectorMap: Map<string, Type>,
  ): RenderNode[] {
    const parsed = this.microsyntax.parseNgFor(node.expression);
    const items = this.evaluateExpression(parsed.iterableName, context);

    if (!Array.isArray(items)) return [];

    const ngFor = new NgForOf();
    ngFor.setItems(items);

    const result: RenderNode[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const forContext = ngFor.getContext(item, i);

      // Merge contexts: parent + loop variables
      const mergedContext: Record<string, any> = {
        ...context,
        [parsed.itemName]: item,
      };

      // Map additional variables (let i = index, let isFirst = first, etc.)
      for (const variable of parsed.variables) {
        if (variable.value && variable.name !== parsed.itemName) {
          mergedContext[variable.name] = (forContext as any)[variable.value];
        }
      }

      const nodes = this.buildLayoutTree(node.children, mergedContext, view, selectorMap);
      result.push(...nodes);
    }

    return result;
  }

  private processNgIf(
    node: TTemplate,
    context: Record<string, any>,
    view: ComponentView,
    selectorMap: Map<string, Type>,
  ): RenderNode[] | null {
    const parsed = this.microsyntax.parseNgIf(node.expression);
    const condition = this.evaluateExpression(parsed.expression, context);

    const ngIf = new NgIf();
    ngIf.setCondition(condition);

    if (!ngIf.shouldRender()) {
      return [];
    }

    return this.buildLayoutTree(node.children, context, view, selectorMap);
  }

  private evaluateExpression(expression: string, context: Record<string, any>): any {
    let parsed = this.expressionCache.get(expression);
    if (!parsed) {
      parsed = this.parser.parse(expression);
      this.expressionCache.set(expression, parsed);
    }
    return this.evaluator.evaluate(parsed, context);
  }

  private renderLayoutTree(node: RenderNode, buffer: ScreenBuffer): void {
    if (!node.computed) return;

    const layout = node.computed;
    const type = node._widgetType;
    const props = node._widgetProps;

    switch (type) {
      case 'box':
        renderBox(buffer, layout, props);
        break;
      case 'text':
        renderText(buffer, layout, {
          content: props.content || '',
          style: props.style,
          textAlign: props.textAlign,
        });
        break;
      case 'input':
        renderInput(buffer, layout, props);
        break;
      case 'spinner':
        renderSpinner(buffer, layout, props);
        break;
      case 'progress':
        renderProgress(buffer, layout, props);
        break;
      case 'list':
        renderList(buffer, layout, props);
        break;
      case 'select':
        renderSelect(buffer, layout, props);
        break;
      case 'table':
        renderTable(buffer, layout, props);
        break;
      case 'root':
        // Container only — no rendering, just recurse
        break;
    }

    // Render children
    for (const child of node.children as RenderNode[]) {
      // Offset child computed positions to be absolute
      if (child.computed) {
        child.computed = {
          left: layout.left + child.computed.left,
          top: layout.top + child.computed.top,
          width: child.computed.width,
          height: child.computed.height,
        };
      }
      this.renderLayoutTree(child, buffer);
    }
  }

  private buildSelectorMap(components?: Type[]): Map<string, Type> {
    const map = new Map<string, Type>();
    if (!components) return map;

    for (const comp of components) {
      const meta = getComponentMetadata(comp) as ComponentDef | undefined;
      if (meta?.selector) {
        map.set(meta.selector, comp);
      }
    }

    return map;
  }

  private nextId(): string {
    return `n${++this.nodeCounter}`;
  }
}

function toNumber(value: any): number | string | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Pass percentage strings through for Yoga to handle
    if (value.endsWith('%')) return value;
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
  }
  return undefined;
}
