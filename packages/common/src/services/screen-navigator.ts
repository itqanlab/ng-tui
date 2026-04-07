import { Injectable, type Type } from '@ng-tui/core';

export interface Route {
  name: string;
  component: Type;
  params?: string[];
  canActivate?: Type[];
}

export interface ActivatedRoute {
  name: string;
  params: Record<string, string>;
}

/**
 * Simple screen navigator — hybrid router.
 * Named routes with stack-based history.
 */
@Injectable()
export class ScreenNavigator {
  private routes: Route[] = [];
  private history: ActivatedRoute[] = [];
  private listeners: Array<(route: ActivatedRoute) => void> = [];

  registerRoutes(routes: Route[]): void {
    this.routes = routes;
  }

  navigate(name: string, params: Record<string, string> = {}): void {
    const route = this.routes.find((r) => r.name === name);
    if (!route) {
      throw new Error(`Route not found: ${name}`);
    }

    const activated: ActivatedRoute = { name, params };
    this.history.push(activated);
    this.notifyListeners(activated);
  }

  back(): boolean {
    if (this.history.length <= 1) return false;
    this.history.pop();
    const previous = this.history[this.history.length - 1];
    this.notifyListeners(previous);
    return true;
  }

  get current(): ActivatedRoute | undefined {
    return this.history[this.history.length - 1];
  }

  get currentRoute(): Route | undefined {
    const activated = this.current;
    if (!activated) return undefined;
    return this.routes.find((r) => r.name === activated.name);
  }

  onChange(listener: (route: ActivatedRoute) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(route: ActivatedRoute): void {
    for (const listener of this.listeners) {
      listener(route);
    }
  }
}
