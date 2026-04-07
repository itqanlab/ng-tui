// Renderer
export {
  TerminalRenderer,
  ScreenBuffer,
  AnsiWriter,
  createEmptyCell,
  cellsEqual,
  diffBuffers,
  SYNC_START,
  SYNC_END,
  wrapSynchronized,
} from './renderer/index.js';
export type { Cell, CellChange } from './renderer/index.js';

// Layout
export { YogaAdapter, LayoutTree } from './layout/index.js';
export type { ComputedLayout, LayoutNode, LayoutProps } from './layout/index.js';

// Widgets
export {
  WidgetRegistry,
  renderBox,
  renderText,
  renderInput,
  renderSpinner,
  getSpinnerFrameCount,
  renderProgress,
  renderList,
  renderSelect,
  renderTable,
} from './widgets/index.js';
export type { WidgetRenderFn, BorderStyle } from './widgets/index.js';

// Events
export { KeyboardListener, ResizeListener, MouseListener } from './events/index.js';
export type { KeyEvent, ResizeEvent } from './events/index.js';
export type { MouseEvent as TerminalMouseEvent } from './events/index.js';

// Screen
export {
  Screen,
  hideCursor,
  showCursor,
  moveCursor,
  saveCursor,
  restoreCursor,
  getTerminalSize,
  supportsColor,
  supportsTrueColor,
} from './screen/index.js';

// Styles
export { parseStyleBindings, isNamedColor, isHexColor } from './styles/index.js';
export type { NamedColor } from './styles/index.js';

// Platform
export {
  PlatformTerminal,
  provideTerminal,
  TERMINAL_CONFIG,
  emergencyCleanup,
  registerCleanupHandlers,
} from './platform/index.js';
export type { TerminalConfig } from './platform/index.js';
