---
layout: home

hero:
  name: ng-tui
  text: Terminal UIs with Angular Syntax
  tagline: Build interactive terminal apps using decorators, dependency injection, signals, and template syntax — rendered with flexbox layout and a double-buffer ANSI diff renderer.
  image:
    src: /logo.svg
    alt: ng-tui
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/itqanlab/ng-tui

features:
  - icon: "@"
    title: Decorators
    details: "@Component, @Injectable, @Input, @Output, @Pipe — the same patterns Angular and NestJS developers already know."
  - icon: "{ }"
    title: Dependency Injection
    details: "Constructor-based DI with providers, injection tokens, and automatic type resolution via reflect-metadata."
  - icon: "~"
    title: Signals & Reactivity
    details: "signal(), computed(), effect() for synchronous state. RxJS for async streams. Automatic re-render on change."
  - icon: "*"
    title: Template Syntax
    details: "Interpolation, [property] binding, (event) binding, *ngFor, *ngIf, *ngSwitch — all in your terminal."
  - icon: "="
    title: Flexbox Layout
    details: "CSS-like flexbox via Yoga WASM. No manual cursor math — just set flexDirection, flexGrow, and let the engine compute positions."
  - icon: "#"
    title: Built-in Widgets
    details: "box, text, input, list, spinner, progress, table, select — ready-to-use terminal components with border styles and theming."
---

## What does it look like?

```typescript
import { Component, signal, bootstrapApplication } from '@ng-tui/core';
import { provideTerminal } from '@ng-tui/platform-terminal';

@Component({
  selector: 'app-root',
  template: `
    <box [flexDirection]="'column'" [borderStyle]="'rounded'" [title]="'Hello'">
      <text [style.bold]="true">Welcome to ng-tui</text>
      <text *ngFor="let item of items()">{{ item }}</text>
      <input (submit)="onAdd($event)" [placeholder]="'Add item...'" />
    </box>
  `
})
class AppComponent {
  items = signal(['First item', 'Second item']);

  onAdd(text: string) {
    this.items.update(list => [...list, text]);
  }
}

bootstrapApplication(AppComponent, {
  providers: [provideTerminal({ alternateBuffer: true })],
});
```

## Why ng-tui?

**For Angular developers** who want to build CLI tools with the syntax they already know.

**For CLI developers** who want a real component framework instead of manual ANSI escape codes.

**Inspired by** NestJS (Angular patterns on the server), React Ink (React in the terminal), and the growing trend of AI-powered CLI tools like Claude Code and OpenCode.
