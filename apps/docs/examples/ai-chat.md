# AI Chat Example

A full-screen AI chat interface built with ng-tui — the kind of TUI you see in Claude Code, OpenCode, and similar tools.

## What it looks like

```
┌─ ng-tui demo ──────────────────────── claude-sonnet ─┐
│                                                       │
│  Welcome to ng-tui                                    │
│  Your AI coding assistant                             │
│                                                       │
│  Type a message to get started, or try:               │
│    /help     — show available commands                │
│    /model    — change AI model                        │
│    /clear    — clear conversation                     │
│                                                       │
├───────────────────────────────────────────────────────┤
│ >                                                     │
└───────────────────────────────────────────────────────┘
  cwd: ~/projects/my-app    tokens: 0    [ctrl+s] send
```

## Implementation

### Bootstrap

```typescript
// main.ts
import { bootstrapApplication } from '@ng-tui/core';
import { provideTerminal } from '@ng-tui/platform-terminal';
import { AppComponent } from './app.component';
import { AiService } from './services/ai.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideTerminal({ alternateBuffer: true }),
    AiService,
  ]
});
```

### App Component

```typescript
// app.component.ts
import { Component, OnInit, signal } from '@ng-tui/core';
import { AiService } from './services/ai.service';

@Component({
  selector: 'app-root',
  template: `
    <box [flexDirection]="'column'" [height]="'100%'" [width]="'100%'">

      <!-- Main chat area -->
      <box [flexGrow]="1"
           [borderStyle]="'rounded'"
           [title]="'ng-tui demo'"
           [titleRight]="model()"
           [flexDirection]="'column'"
           [padding]="1">

        <!-- Welcome message (shown when no messages) -->
        <box *ngIf="messages().length === 0" [flexDirection]="'column'">
          <text [style.bold]="true">Welcome to ng-tui</text>
          <text [style.color]="'gray'">Your AI coding assistant</text>
          <text></text>
          <text>Type a message to get started, or try:</text>
          <text [style.color]="'cyan'">  /help     — show available commands</text>
          <text [style.color]="'cyan'">  /model    — change AI model</text>
          <text [style.color]="'cyan'">  /clear    — clear conversation</text>
        </box>

        <!-- Chat messages -->
        <box *ngFor="let msg of messages()" [flexDirection]="'column'">
          <text [style.bold]="true"
                [style.color]="msg.role === 'user' ? 'blue' : 'green'">
            {{ msg.role }}
          </text>
          <text>{{ msg.text }}</text>
          <text></text>
        </box>

        <!-- Loading spinner -->
        <spinner *ngIf="loading()">Thinking...</spinner>
      </box>

      <!-- Input area -->
      <box [height]="3" [borderStyle]="'single'">
        <input [placeholder]="'Type a message...'"
               (submit)="onSend($event)"
               [focus]="true">
        </input>
      </box>

      <!-- Status bar -->
      <box [height]="1" [flexDirection]="'row'" [padding.left]="1">
        <text [style.color]="'gray'">cwd: {{ cwd }}</text>
        <text [style.color]="'gray'" [flexGrow]="1" [textAlign]="'center'">
          tokens: {{ tokenCount() }}
        </text>
        <text [style.color]="'gray'">[ctrl+s] send  [?] help</text>
      </box>
    </box>
  `
})
export class AppComponent implements OnInit {
  messages = signal<{ role: string; text: string }[]>([]);
  loading = signal(false);
  model = signal('claude-sonnet');
  tokenCount = signal(0);
  cwd = process.cwd().replace(process.env.HOME || '', '~');

  constructor(private ai: AiService) {}

  ngOnInit() {
    this.ai.model$.subscribe(m => this.model.set(m));
    this.ai.tokens$.subscribe(t => this.tokenCount.set(t));
  }

  onSend(text: string) {
    if (text.startsWith('/')) {
      this.handleCommand(text);
      return;
    }

    this.messages.update(msgs => [...msgs, { role: 'user', text }]);
    this.loading.set(true);

    this.ai.stream(text).subscribe({
      next: (chunk) => {
        this.messages.update(msgs => {
          const last = msgs[msgs.length - 1];
          if (last?.role === 'assistant') {
            return [...msgs.slice(0, -1), { ...last, text: last.text + chunk }];
          }
          return [...msgs, { role: 'assistant', text: chunk }];
        });
      },
      complete: () => this.loading.set(false),
    });
  }

  private handleCommand(cmd: string) {
    switch (cmd) {
      case '/clear':
        this.messages.set([]);
        break;
      case '/help':
        this.messages.update(msgs => [...msgs, {
          role: 'system',
          text: 'Commands: /help, /model, /clear'
        }]);
        break;
    }
  }
}
```

## What this demonstrates

| ng-tui Feature | Used in |
|---|---|
| Declarative templates | The entire template |
| Flexbox layout | Column layout, flexGrow, fixed heights |
| Built-in widgets | `<box>`, `<text>`, `<input>`, `<spinner>` |
| Component decorators | `@Component({ selector, template })` |
| Dependency injection | `constructor(private ai: AiService)` |
| Signals | `signal()`, `.set()`, `.update()` |
| Structural directives | `*ngIf`, `*ngFor` |
| Event binding | `(submit)="onSend($event)"` |
| Property binding | `[borderStyle]`, `[title]`, `[style.color]` |
| Interpolation | <code v-pre>{{ msg.text }}</code>, <code v-pre>{{ cwd }}</code> |
| Lifecycle hooks | `ngOnInit` |
