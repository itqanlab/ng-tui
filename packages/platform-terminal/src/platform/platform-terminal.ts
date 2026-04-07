import { Injectable, type Provider, InjectionToken } from '@ng-tui/core';
import { Screen } from '../screen/screen.js';
import { KeyboardListener } from '../events/keyboard.js';
import { ResizeListener } from '../events/resize.js';
import { TerminalRenderer } from '../renderer/terminal-renderer.js';
import { YogaAdapter } from '../layout/yoga-adapter.js';
import { WidgetRegistry } from '../widgets/widget-registry.js';

export interface TerminalConfig {
  alternateBuffer?: boolean;
}

export const TERMINAL_CONFIG = new InjectionToken<TerminalConfig>('TERMINAL_CONFIG');

/**
 * Bootstraps the terminal environment.
 * Sets up screen, keyboard, renderer, layout engine.
 */
@Injectable()
export class PlatformTerminal {
  readonly screen = new Screen();
  readonly keyboard = new KeyboardListener();
  readonly resize = new ResizeListener();
  readonly renderer: TerminalRenderer;
  readonly yoga = new YogaAdapter();
  readonly widgets = new WidgetRegistry();

  constructor() {
    this.renderer = new TerminalRenderer();
  }

  async init(config?: TerminalConfig): Promise<void> {
    await this.yoga.init();

    if (config?.alternateBuffer) {
      this.screen.enterAlternateBuffer();
    }

    this.screen.hideCursor();
    this.keyboard.start();
    this.resize.start();
  }

  destroy(): void {
    this.keyboard.stop();
    this.resize.stop();
    this.screen.cleanup();
  }
}

/**
 * Provider factory for terminal configuration.
 */
export function provideTerminal(config: TerminalConfig = {}): Provider[] {
  return [
    { provide: TERMINAL_CONFIG, useValue: config },
    PlatformTerminal,
  ];
}
