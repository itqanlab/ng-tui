export { PlatformTerminal, provideTerminal, TERMINAL_CONFIG } from './platform-terminal.js';
export type { TerminalConfig } from './platform-terminal.js';
export { emergencyCleanup, registerCleanupHandlers } from './destroy.js';
export { ComponentRenderer } from './component-renderer.js';
export type { ComponentView } from './component-renderer.js';
export { dispatchKeyEvent } from './event-dispatcher.js';
export { registerCommonPipes } from './pipe-setup.js';
export { bootstrapTerminalApplication } from './terminal-bootstrapper.js';
export type { TerminalApplicationConfig, TerminalApplicationRef } from './terminal-bootstrapper.js';
