# ng-tui: Developer Capabilities

## What ng-tui gives developers

ng-tui is a framework for building terminal user interfaces using Angular-like syntax. Here's what developers can do with it.

---

## 1. Declarative Terminal UIs

Write terminal UIs with templates instead of manual ANSI codes.

```typescript
// Without ng-tui (imperative):
process.stdout.write('\x1b[2J\x1b[1;1H');
process.stdout.write('\x1b[1m┌─ My App ─┐\x1b[0m\n');
process.stdout.write('│ Hello    │\n');
process.stdout.write('└──────────┘\n');

// With ng-tui (declarative):
@Component({
  selector: 'app-root',
  template: `
    <box [borderStyle]="'rounded'" [title]="'My App'">
      <text>Hello</text>
    </box>
  `
})
export class AppComponent {}
```

---

## 2. Component-Based Architecture

Break complex UIs into reusable, composable components — each with its own template, logic, and lifecycle.

```typescript
// header.component.ts
@Component({
  selector: 'app-header',
  template: `
    <box [height]="1" [borderStyle]="'none'">
      <text [style.bold]="true">{{ title }}</text>
      <text [style.color]="'gray'" [alignSelf]="'flex-end'">v{{ version }}</text>
    </box>
  `
})
export class HeaderComponent {
  @Input() title = '';
  @Input() version = '';
}

// Use it in another component
@Component({
  selector: 'app-root',
  template: `
    <box [flexDirection]="'column'">
      <app-header [title]="'My Tool'" [version]="'1.0.0'"></app-header>
      <app-content></app-content>
    </box>
  `
})
export class AppComponent {}
```

---

## 3. Dependency Injection

Wire up services cleanly. Swap implementations for testing. Familiar to any Angular/NestJS developer.

```typescript
@Injectable()
export class ConfigService {
  constructor(private fs: FileSystemService) {}
  
  load() {
    return this.fs.readJson('.myapprc');
  }
}

@Injectable()
export class AiService {
  constructor(
    private config: ConfigService,
    @Inject(AI_PROVIDER) private provider: AiProvider,
  ) {}

  stream(prompt: string): Observable<string> {
    return this.provider.stream(prompt);
  }
}

// Bootstrap with providers
bootstrapApplication(AppComponent, {
  providers: [
    ConfigService,
    { provide: AI_PROVIDER, useClass: ClaudeProvider },
  ]
});
```

---

## 4. Reactive State Management

Signals for synchronous state. RxJS for async streams. Automatic re-render when state changes.

```typescript
@Component({
  selector: 'app-chat',
  template: `
    <box [flexDirection]="'column'">
      <text *ngFor="let msg of messages()">{{ msg.role }}: {{ msg.text }}</text>
      <spinner *ngIf="loading()">Thinking...</spinner>
    </box>
  `
})
export class ChatComponent {
  messages = signal<Message[]>([]);
  loading = signal(false);
  messageCount = computed(() => this.messages().length);

  constructor(private ai: AiService) {}

  send(text: string) {
    this.loading.set(true);
    this.messages.update(msgs => [...msgs, { role: 'user', text }]);

    this.ai.stream(text).subscribe({
      next: (chunk) => this.messages.update(msgs => {
        const last = msgs[msgs.length - 1];
        return [...msgs.slice(0, -1), { ...last, text: last.text + chunk }];
      }),
      complete: () => this.loading.set(false),
    });
  }
}
```

---

## 5. Flexbox Layout in Terminal

No manual cursor math. CSS-like flexbox that responds to terminal resize.

```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <box [flexDirection]="'row'" [height]="'100%'">
      <!-- Sidebar: fixed width -->
      <box [width]="30" [borderStyle]="'single'" [flexDirection]="'column'">
        <text [style.bold]="true">Files</text>
        <list [items]="files" (select)="onFileSelect($event)"></list>
      </box>
      
      <!-- Main area: fills remaining space -->
      <box [flexGrow]="1" [borderStyle]="'rounded'" [flexDirection]="'column'">
        <text>{{ selectedFile }}</text>
      </box>
    </box>
  `
})
export class DashboardComponent { ... }
```

---

## 6. Built-in Widgets

Ready-to-use terminal components.

| Widget | Description | Example |
|---|---|---|
| `<box>` | Container with borders, padding, flex | Layout structure, panels |
| `<text>` | Styled text (color, bold, italic, underline) | Labels, content, messages |
| `<input>` | Text input with cursor, editing, history | Chat input, search, prompts |
| `<list>` | Scrollable list with keyboard nav | File browsers, menus |
| `<select>` | Single/multi selection menu | Options, model picker |
| `<spinner>` | Animated loading indicator | "Thinking...", async ops |
| `<progress>` | Progress bar with percentage | Downloads, file processing |
| `<table>` | Column-aligned data table | Data display, logs |

---

## 7. Custom Widgets

Developers can create their own reusable widgets.

```typescript
@Component({
  selector: 'markdown',
  template: `
    <box [flexDirection]="'column'">
      <text *ngFor="let line of renderedLines()" [style]="line.style">
        {{ line.text }}
      </text>
    </box>
  `
})
export class MarkdownWidget implements OnChanges {
  @Input() content = '';
  renderedLines = signal<RenderedLine[]>([]);

  ngOnChanges() {
    this.renderedLines.set(this.parseMarkdown(this.content));
  }

  private parseMarkdown(md: string): RenderedLine[] { ... }
}

// Usage in any other component:
// <markdown [content]="response"></markdown>
```

---

## 8. Theming

Global color schemes that apply across all widgets.

```typescript
// Define a theme
const draculaTheme: Theme = {
  name: 'dracula',
  colors: {
    primary: '#bd93f9',
    secondary: '#6272a4',
    background: '#282a36',
    surface: '#44475a',
    text: '#f8f8f2',
    textMuted: '#6272a4',
    success: '#50fa7b',
    warning: '#f1fa8c',
    error: '#ff5555',
    border: '#6272a4',
    borderFocused: '#bd93f9',
  },
  borders: {
    default: 'rounded',
    focused: 'double',
  },
};

// Apply at bootstrap
bootstrapApplication(AppComponent, {
  providers: [
    provideTerminal({ alternateBuffer: true }),
    provideTheme(draculaTheme),
  ]
});

// Use in templates — widgets auto-inherit theme colors
// Or access explicitly:
@Component({
  template: `<text [style.color]="theme.colors.primary">Themed text</text>`
})
export class MyComponent {
  constructor(public theme: ThemeService) {}
}
```

Built-in themes: `default`, `dark`, `light`, `dracula`, `monokai`.

---

## 9. Plugin System

Third-party packages can extend ng-tui with new widgets, services, and screens.

```typescript
// Plugin: @ng-tui/ai
import { provideAi, ClaudeProvider, OpenAiProvider } from '@ng-tui/ai';

bootstrapApplication(AppComponent, {
  providers: [
    provideAi({ provider: ClaudeProvider, model: 'claude-sonnet-4-20250514' }),
  ]
});

// Plugin: @ng-tui/charts
import { BarChart, LineChart } from '@ng-tui/charts';
// <bar-chart [data]="cpuUsage" [height]="10"></bar-chart>

// Plugin: @ng-tui/markdown
import { Markdown } from '@ng-tui/markdown';
// <markdown [content]="response"></markdown>

// Plugin: @ng-tui/syntax
import { CodeBlock } from '@ng-tui/syntax';
// <code-block [code]="snippet" [language]="'typescript'"></code-block>
```

### Plugin API

```typescript
// How plugin authors register their extensions
export function provideMyPlugin(config: MyPluginConfig): Provider[] {
  return [
    { provide: MY_PLUGIN_CONFIG, useValue: config },
    MyPluginService,
    // Register custom widgets
    { provide: WIDGET_REGISTRY, useValue: { selector: 'my-widget', component: MyWidget }, multi: true },
  ];
}
```

---

## 10. Screen Navigation (Hybrid Router)

Navigate between screens with a simple API. Stack-based history with named routes.

```typescript
// Define routes
const routes: Routes = [
  { name: 'home', component: HomeScreen },
  { name: 'chat', component: ChatScreen },
  { name: 'settings', component: SettingsScreen },
  { name: 'model-picker', component: ModelPickerScreen },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
  ]
});

// Navigate
@Injectable()
export class SomeService {
  constructor(private router: Router) {}

  goToChat() {
    this.router.navigate('chat');                    // push to history
  }

  goToSettings() {
    this.router.navigate('settings', { tab: 'ai' }); // with params
  }

  goBack() {
    this.router.back();                               // pop history
  }
}

// Route params in components
@Component({ ... })
export class SettingsScreen implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const tab = this.route.params['tab']; // 'ai'
  }
}
```

### Phase 2: Route Guards

```typescript
// Prevent navigation without config
const routes: Routes = [
  { name: 'chat', component: ChatScreen, canActivate: [ConfigGuard] },
];

@Injectable()
export class ConfigGuard {
  constructor(private config: ConfigService) {}

  canActivate(): boolean {
    return this.config.isLoaded();
  }
}
```

---

## 11. Developer Tooling (CLI)

| Command | What it does |
|---|---|
| `ng-tui new my-app` | Scaffold a new project with all config |
| `ng-tui generate component chat` | Generate component boilerplate |
| `ng-tui generate service ai` | Generate injectable service |
| `ng-tui generate pipe truncate` | Generate custom pipe |
| `ng-tui serve` | Run in dev mode with hot reload |
| `ng-tui build` | Compile for distribution |

---

## 12. Built-in Pipes

| Pipe | Usage | Output |
|---|---|---|
| `uppercase` | `{{ text \| uppercase }}` | `HELLO` |
| `lowercase` | `{{ text \| lowercase }}` | `hello` |
| `titlecase` | `{{ text \| titlecase }}` | `Hello World` |
| `date` | `{{ timestamp \| date:'short' }}` | `4/7/26, 2:30 PM` |
| `json` | `{{ obj \| json }}` | `{ "key": "value" }` |
| `slice` | `{{ list \| slice:0:5 }}` | First 5 items |
| `truncate` | `{{ text \| truncate:40 }}` | `This is a long te...` |
| `ansi` | `{{ text \| ansi:'bold,red' }}` | Bold red text |

---

## 13. Lifecycle Hooks

| Hook | When it fires |
|---|---|
| `ngOnInit` | Component mounted to terminal |
| `ngOnDestroy` | Component removed from terminal |
| `ngOnChanges` | `@Input()` values changed |
| `ngAfterViewInit` | After child components are initialized |

---

## MVP Target: AI Coding Assistant First Screen

The MVP should demonstrate ng-tui can build the first screen a user sees when launching an AI coding CLI — the common pattern shared by Claude Code, OpenCode, and Codex.

### Reference: What existing tools show on launch

**Claude Code:**
```
╭──────────────────────────────────────────╮
│  ✻ Claude Code                     v1.x  │
│                                          │
│  /help for commands, /status for info    │
╰──────────────────────────────────────────╯

  cwd: /path/to/project

  >
```
- Boxed header with name + version
- Working directory
- Simple `>` prompt input
- Minimal, inline REPL style

**OpenCode:**
```
┌─ Chat ──────────────────────────────────────────┐
│                                                  │
│  Welcome to OpenCode                             │
│                                                  │
│                                                  │
│                                                  │
├──────────────────────────────────────────────────┤
│ >                                                │
└──────────────────────────────────────────────────┘
  [ctrl+s] send  [ctrl+k] commands  [tab] files  [ctrl+c] quit
```
- Full-screen TUI with bordered panels
- Chat area (main panel)
- Input area (bottom panel)
- Key binding hints (status bar)
- Session/model indicator

**Codex:**
```
┌ codex v0.x
│
│ model: o4-mini
│ approval: suggest
│
└ cwd: /path/to/project

>
```
- Line-drawn header with version
- Model name shown
- Approval mode shown
- Working directory
- Simple `>` prompt

### Common UI Elements Across All Three

| Element | Claude Code | OpenCode | Codex | ng-tui MVP |
|---|---|---|---|---|
| **Header / title bar** | Boxed, name + version | Panel title | Line-drawn, version | Yes |
| **Model indicator** | No | Yes | Yes | Yes |
| **Working directory** | Yes | Internal | Yes | Yes |
| **Chat/message area** | Inline | Bordered panel | Inline | Yes (panel) |
| **Input area** | `>` prompt | Bordered input pane | `>` prompt | Yes (input widget) |
| **Status bar / keybinds** | No | Yes | No | Yes |
| **Full-screen TUI** | No | Yes | No | Yes (like OpenCode) |

### MVP First Screen: ng-tui Demo

The MVP should produce a full-screen TUI (OpenCode-style) since that better demonstrates the framework's layout and widget capabilities:

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
│                                                       │
│                                                       │
│                                                       │
│                                                       │
├───────────────────────────────────────────────────────┤
│ >                                                     │
└───────────────────────────────────────────────────────┘
  cwd: ~/projects/my-app    tokens: 0    [ctrl+s] send  [?] help
```

### MVP Implementation in ng-tui

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
          <text [style.bold]="true" [style.color]="msg.role === 'user' ? 'blue' : 'green'">
            {{ msg.role === 'user' ? '>' : '✻' }} {{ msg.role }}
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

### What this MVP demonstrates

| ng-tui Capability | Demonstrated by |
|---|---|
| Declarative templates | The entire template |
| Flexbox layout | Column layout, flexGrow, fixed heights |
| Built-in widgets | `<box>`, `<text>`, `<input>`, `<spinner>` |
| Component decorators | `@Component({ selector, template })` |
| Dependency injection | `constructor(private ai: AiService)` |
| Signals | `signal()`, `computed()`, `.set()`, `.update()` |
| Structural directives | `*ngIf`, `*ngFor` |
| Event binding | `(submit)="onSend($event)"` |
| Property binding | `[borderStyle]`, `[title]`, `[style.color]` |
| Interpolation | `{{ msg.text }}`, `{{ cwd }}` |
| Lifecycle hooks | `ngOnInit` |
| Pipes | Could add `{{ msg.text \| truncate:80 }}` |
| Theming | Border styles, color scheme |
| RxJS integration | `subscribe()` on AI stream |

---

## Summary: What developers get

| Category | Capabilities |
|---|---|
| **UI** | Declarative templates, flexbox layout, 8+ built-in widgets, custom widgets, theming |
| **Architecture** | Components, DI, services, lifecycle hooks, signals, RxJS |
| **Navigation** | Named routes, stack history, params, guards |
| **Templates** | Interpolation, property/event binding, *ngFor, *ngIf, pipes |
| **Extensibility** | Plugin system, custom widgets, custom pipes, provider-based config |
| **Tooling** | CLI scaffolding, code generation, dev server with hot reload |
| **Ecosystem** | Planned plugins: @ng-tui/ai, @ng-tui/charts, @ng-tui/markdown, @ng-tui/syntax |
