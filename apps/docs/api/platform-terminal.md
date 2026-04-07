# @ng-tui/platform-terminal

The terminal rendering platform. Handles Yoga flexbox layout, double-buffer ANSI diff rendering, built-in widgets, keyboard/mouse/resize events, and application bootstrapping.

## Platform Setup

### provideTerminal

Factory function that returns DI providers for terminal integration:

```typescript
function provideTerminal(config?: TerminalConfig): Provider[];
```

```typescript
import { provideTerminal } from '@ng-tui/platform-terminal';

bootstrapApplication(AppComponent, {
  providers: [provideTerminal({ alternateBuffer: true })],
});
```

### TerminalConfig

```typescript
interface TerminalConfig {
  alternateBuffer?: boolean; // Use alternate screen buffer (recommended)
}
```

### TERMINAL_CONFIG

Injection token for accessing terminal configuration:

```typescript
const TERMINAL_CONFIG: InjectionToken<TerminalConfig>;
```

## Rendering

### TerminalRenderer

Orchestrates layout → buffer → diff → ANSI output:

```typescript
class TerminalRenderer {
  render(nextBuffer: ScreenBuffer): void;
  fullRedraw(buffer: ScreenBuffer): void;
  getSize(): { width: number; height: number };
  clear(): void;
  hideCursor(): void;
  showCursor(): void;
}
```

### ScreenBuffer

2D grid of styled cells for double-buffering:

```typescript
class ScreenBuffer {
  readonly width: number;
  readonly height: number;

  get(x: number, y: number): Cell;
  set(x: number, y: number, cell: Cell): void;
  writeString(x: number, y: number, text: string, style?: Partial<Cell>): void;
  clear(): void;
  diff(other: ScreenBuffer): CellChange[];
  clone(): ScreenBuffer;
}
```

### Cell

A single styled terminal cell:

```typescript
interface Cell {
  char: string;
  fg?: string;     // Foreground color
  bg?: string;     // Background color
  bold?: boolean;
  dim?: boolean;
  underline?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
}
```

### Diff Utilities

```typescript
interface CellChange {
  x: number;
  y: number;
  cell: Cell;
}

function createEmptyCell(): Cell;
function cellsEqual(a: Cell, b: Cell): boolean;
function diffBuffers(prev: ScreenBuffer, next: ScreenBuffer): CellChange[];
```

### AnsiWriter

Writes ANSI escape sequences to an output stream:

```typescript
class AnsiWriter {
  // Writes styled cells as ANSI escape sequences
}
```

### Sync Control

Batch screen updates for flicker-free rendering:

```typescript
const SYNC_START: string;   // Begin synchronized update
const SYNC_END: string;     // End synchronized update
function wrapSynchronized(content: string): string;
```

## Layout Engine

### YogaAdapter

Wraps Yoga-layout WASM for flexbox computation:

```typescript
class YogaAdapter {
  async init(): Promise<void>;
  createNode(): YogaNode;
  applyProps(node: YogaNode, props: LayoutProps): void;
  calculateLayout(node: YogaNode, width: number, height: number): void;
  getComputedLayout(node: YogaNode): ComputedLayout;
  freeNode(node: YogaNode): void;
}
```

### LayoutProps

```typescript
interface LayoutProps {
  width?: number | string;
  height?: number | string;
  minWidth?: number;
  maxWidth?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexDirection?: 'row' | 'column';
  padding?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  margin?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  gap?: number;
}
```

### ComputedLayout

```typescript
interface ComputedLayout {
  left: number;
  top: number;
  width: number;
  height: number;
}
```

### LayoutTree

Builds and computes layout for component trees:

```typescript
class LayoutTree {
  compute(root: LayoutNode, width: number, height: number): void;
}

interface LayoutNode {
  id: string;
  props: LayoutProps;
  children: LayoutNode[];
  computed?: ComputedLayout;
}
```

## Widgets

All widget render functions have the signature:

```typescript
type WidgetRenderFn = (buffer: ScreenBuffer, layout: ComputedLayout, props: any) => void;
```

### renderBox

```typescript
function renderBox(buffer: ScreenBuffer, layout: ComputedLayout, props: {
  borderStyle?: 'none' | 'single' | 'double' | 'rounded' | 'bold';
  title?: string;
  titleRight?: string;
}): void;
```

### renderText

```typescript
function renderText(buffer: ScreenBuffer, layout: ComputedLayout, props: {
  content: string;
  style?: Partial<Cell>;
  textAlign?: 'left' | 'center' | 'right';
}): void;
```

### renderInput

```typescript
function renderInput(buffer: ScreenBuffer, layout: ComputedLayout, props: {
  value?: string;
  placeholder?: string;
  focus?: boolean;
  cursorPosition?: number;
}): void;
```

### renderSpinner

```typescript
function renderSpinner(buffer: ScreenBuffer, layout: ComputedLayout, props: {
  text?: string;
  frame?: number;
}): void;

function getSpinnerFrameCount(): number; // 10 frames
```

### renderProgress

```typescript
function renderProgress(buffer: ScreenBuffer, layout: ComputedLayout, props: {
  value?: number;       // 0-100
  showPercentage?: boolean;
}): void;
```

### renderList

```typescript
function renderList(buffer: ScreenBuffer, layout: ComputedLayout, props: {
  items?: string[];
  selectedIndex?: number;
  scrollOffset?: number;
}): void;
```

### renderSelect

```typescript
function renderSelect(buffer: ScreenBuffer, layout: ComputedLayout, props: {
  options?: string[];
  selectedIndex?: number;
}): void;
```

### renderTable

```typescript
function renderTable(buffer: ScreenBuffer, layout: ComputedLayout, props: {
  headers?: string[];
  rows?: string[][];
  columnWidths?: number[];
}): void;
```

### WidgetRegistry

Register custom widget renderers:

```typescript
class WidgetRegistry {
  // Register and retrieve widget render functions by name
}
```

## Event System

### KeyboardListener

```typescript
class KeyboardListener {
  start(): void;
  stop(): void;
  onKey(listener: (event: KeyEvent) => void): () => void;
}

interface KeyEvent {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  raw: string;
}
```

### ResizeListener

```typescript
class ResizeListener {
  start(): void;
  stop(): void;
  onResize(listener: (event: ResizeEvent) => void): () => void;
}

interface ResizeEvent {
  width: number;
  height: number;
}
```

### MouseListener

```typescript
class MouseListener {
  // Captures mouse input events
}

interface MouseEvent {
  x: number;
  y: number;
  button: number;
  type: 'mousedown' | 'mouseup' | 'mousemove';
}
```

## Screen Control

### Screen

```typescript
class Screen {
  hideCursor(): void;
  showCursor(): void;
  moveCursor(x: number, y: number): void;
  saveCursor(): void;
  restoreCursor(): void;
  enterAlternateBuffer(): void;
  cleanup(): void;
}
```

### Standalone Functions

```typescript
function hideCursor(): void;
function showCursor(): void;
function moveCursor(x: number, y: number): void;
function saveCursor(): void;
function restoreCursor(): void;
function getTerminalSize(): { columns: number; rows: number };
function supportsColor(): boolean;
function supportsTrueColor(): boolean;
```

## Style Utilities

```typescript
function parseStyleBindings(styles: string): Record<string, string>;
function isNamedColor(color: string): boolean;
function isHexColor(color: string): boolean;

type NamedColor = 'red' | 'green' | 'blue' | 'cyan' | 'magenta' | 'yellow'
  | 'white' | 'black' | 'gray' | /* ... more CSS named colors */;
```

## Application Bootstrap

### bootstrapTerminalApplication

Full terminal application bootstrapper with reactive rendering loop:

```typescript
function bootstrapTerminalApplication(
  rootComponent: Type,
  config?: TerminalApplicationConfig
): Promise<TerminalApplicationRef>;
```

```typescript
interface TerminalApplicationConfig {
  providers?: Provider[];
  terminal?: TerminalConfig;
}

interface TerminalApplicationRef {
  appRef: ApplicationRef;
  platform: PlatformTerminal;
  rootView: ComponentView;
  destroy(): void;
}
```

### PlatformTerminal

Bootstrap class orchestrating the terminal environment:

```typescript
class PlatformTerminal {
  screen: Screen;
  keyboard: KeyboardListener;
  resize: ResizeListener;
  renderer: TerminalRenderer;
  yoga: YogaAdapter;
  widgets: WidgetRegistry;

  async init(config?: TerminalConfig): Promise<void>;
  destroy(): void;
}
```

### ComponentRenderer

Orchestrates template compilation, expression evaluation, layout, and rendering:

```typescript
class ComponentRenderer {
  buildComponentView(componentClass: Type, instance: any, injector: Injector): ComponentView;
  renderToBuffer(view: ComponentView, buffer: ScreenBuffer, width: number, height: number): void;
}

interface ComponentView {
  componentClass: Type;
  instance: any;
  compiledTemplate: CompiledTemplate;
  viewRef: ViewRef;
  childViews: ComponentView[];
  eventHandlers: Map<string, Function[]>;
}
```

### Utilities

```typescript
function emergencyCleanup(): void;
function registerCleanupHandlers(): void;
function dispatchKeyEvent(view: ComponentView, event: KeyEvent): void;
function registerCommonPipes(evaluator: ExpressionEvaluator): void;
```
