import {
  type ApplicationConfig,
  type ApplicationRef,
  type Provider,
  type Type,
  bootstrapApplication,
  effect,
  runAfterViewInit,
  runOnDestroy,
  signal,
} from '@ng-tui/core';
import { ScreenBuffer } from '../renderer/screen-buffer.js';
import { ComponentRenderer, type ComponentView } from './component-renderer.js';
import { registerCleanupHandlers } from './destroy.js';
import { dispatchKeyEvent } from './event-dispatcher.js';
import { PlatformTerminal, type TerminalConfig, provideTerminal } from './platform-terminal.js';

export interface TerminalApplicationConfig {
  providers?: Provider[];
  terminal?: TerminalConfig;
}

export interface TerminalApplicationRef {
  appRef: ApplicationRef;
  platform: PlatformTerminal;
  rootView: ComponentView;
  destroy(): void;
}

/**
 * Bootstraps an ng-tui terminal application.
 * Connects the component system to the terminal renderer with reactive updates.
 */
export async function bootstrapTerminalApplication(
  rootComponent: Type,
  config: TerminalApplicationConfig = {},
): Promise<TerminalApplicationRef> {
  const userProviders = config.providers || [];
  const terminalProviders = provideTerminal(config.terminal || {});

  // Bootstrap the application with all providers
  const appRef = bootstrapApplication(rootComponent, {
    providers: [...userProviders, ...terminalProviders],
  });

  // Resolve platform services
  const platform = appRef.injector.resolve(PlatformTerminal);

  // Initialize terminal (Yoga WASM init is async)
  await platform.init(config.terminal);

  // Register emergency cleanup handlers
  registerCleanupHandlers();

  // Create the component renderer
  const renderer = new ComponentRenderer(platform.yoga);

  // Build the root component view
  const rootView = renderer.buildComponentView(rootComponent, appRef.root, appRef.injector);

  // Store injector on view context for child component resolution
  rootView.viewRef.context.__injector__ = appRef.injector;

  // Terminal size as signals for reactive re-renders on resize
  const termWidth = signal(process.stdout.columns || 80);
  const termHeight = signal(process.stdout.rows || 24);

  // Wire resize events to size signals
  const unsubResize = platform.resize.onResize((event) => {
    termWidth.set(event.width);
    termHeight.set(event.height);
  });

  // Track first render for lifecycle hooks
  let firstRender = true;

  // Effect-based render loop: auto-tracks all signals read during rendering
  const cleanupEffect = effect(() => {
    const w = termWidth();
    const h = termHeight();
    const buffer = new ScreenBuffer(w, h);
    renderer.renderToBuffer(rootView, buffer, w, h);
    platform.renderer.render(buffer);

    if (firstRender) {
      firstRender = false;
      runAfterViewInit(appRef.root);
    }
  });

  // Wire keyboard events to component event handlers
  const unsubKeyboard = platform.keyboard.onKey((event) => {
    dispatchKeyEvent(rootView, event);

    // Ctrl+C to exit
    if (event.ctrl && event.key === 'c') {
      handle.destroy();
      process.exit(0);
    }
  });

  // Wire ApplicationRef.tick() for manual re-render triggers
  appRef.onTick(() => {
    const w = termWidth();
    const h = termHeight();
    const buffer = new ScreenBuffer(w, h);
    renderer.renderToBuffer(rootView, buffer, w, h);
    platform.renderer.render(buffer);
  });

  const handle: TerminalApplicationRef = {
    appRef,
    platform,
    rootView,
    destroy() {
      cleanupEffect();
      unsubResize();
      unsubKeyboard();
      runOnDestroy(appRef.root);

      // Destroy child component instances
      for (const child of rootView.childViews) {
        runOnDestroy(child.instance);
      }

      platform.destroy();
      appRef.destroy();
    },
  };

  return handle;
}
