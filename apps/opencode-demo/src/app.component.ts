import { Component, type OnInit, signal } from '@ng-tui/core';
import { type ModelGroup, ModelSelectorComponent } from './components/model-selector.component.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const LOGO = [
  '█▀▀█ █▀▀▄ █▀▀▀ █▀▀▄ █▀▀▀ █▀▀█ ▄▀▀█ █▀▀▀',
  '█  █ █▄▄▀ █▀▀  █  █ █    █  █ █  █ █▀▀ ',
  '▀▀▀▀ ▀    ▀▀▀▀ ▀  ▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀',
].join('\n');

interface SlashCommand {
  name: string;
  description: string;
}

const COMMANDS: SlashCommand[] = [
  { name: '/models', description: 'Switch model' },
  { name: '/review', description: 'review changes [commit|branch|pr], defaults to uncommitted' },
  { name: '/compact', description: 'Compact conversation history' },
  { name: '/status', description: 'Show connection and session status' },
  { name: '/help', description: 'Show available commands' },
  { name: '/clear', description: 'Clear conversation' },
];

const MODEL_GROUPS: ModelGroup[] = [
  {
    name: 'Free',
    models: ['Nemotron 3 Super Free', 'Qwen3.6 Plus Free'],
  },
  {
    name: 'OpenAI',
    models: [
      'Codex Mini',
      'GPT-5-Codex',
      'GPT-5.1 Codex mini',
      'GPT-5.2',
      'GPT-5.2 Codex',
      'GPT-5.4',
      'GPT-5.4 mini',
    ],
  },
  {
    name: 'Anthropic',
    models: ['Claude Opus 4.6', 'Claude Sonnet 4.6', 'Claude Haiku 4.5'],
  },
  {
    name: 'Z.AI Coding Plan',
    models: [
      'GLM-4.5',
      'GLM-4.5-Air',
      'GLM-4.5-Flash',
      'GLM-4.5V',
      'GLM-4.6',
      'GLM-4.6V',
      'GLM-4.7',
      'GLM-4.7-Flash',
      'GLM-4.7-FlashX',
      'GLM-5-Turbo',
      'glm-5v-turbo',
    ],
  },
];

function getGitBranch(): string {
  try {
    const head = readFileSync(join(process.cwd(), '.git/HEAD'), 'utf-8').trim();
    if (head.startsWith('ref: refs/heads/')) {
      return head.slice('ref: refs/heads/'.length);
    }
    return head.slice(0, 7);
  } catch {
    return '';
  }
}

@Component({
  selector: 'app-root',
  components: [ModelSelectorComponent],
  template: `
    <box [flexDirection]="'column'"
         [width]="termWidth()"
         [height]="termHeight()"
         (keypress)="onKeypress($event)">

      <box [flexDirection]="'column'"
           [flexGrow]="1"
           [justifyContent]="'center'"
           [alignItems]="'center'">

        <text [fg]="'cyan'" [dim]="true" [textAlign]="'center'"
              [width]="39" [height]="3">{{ logo }}</text>

        <box [height]="2"></box>

        <box [flexDirection]="'column'"
             [width]="inputBoxWidth()"
             [height]="inputBoxHeight()"
             [borderStyle]="'single'"
             [borderFg]="'cyan'"
             [borderTop]="false"
             [borderRight]="false"
             [borderBottom]="false"
             [bg]="'#1e3338'"
             [paddingLeft]="2"
             [paddingTop]="0"
             [paddingBottom]="0">

          <list *ngIf="showAutocomplete()"
                [items]="autocompleteItems()"
                [selectedIndex]="autocompleteIndex()"
                [height]="autocompleteListHeight()"
                [selectedStyle]="autocompleteSelectedStyle"
                [prefix]="'  '"
                [selectedPrefix]="'  '">
          </list>

          <box *ngIf="!showAutocomplete()" [height]="1"></box>

          <input [value]="inputValue()"
                 [placeholder]="placeholder"
                 [focus]="isInputFocused()"
                 [prompt]="''"
                 [height]="1" />

          <box [height]="1"></box>

          <box [flexDirection]="'row'" [height]="1">
            <text [bold]="true" [fg]="'cyan'">{{ provider() }}</text>
            <text [dim]="true" [fg]="'gray'">  {{ currentModel() }}  {{ planName() }}</text>
          </box>
        </box>

        <box [height]="1"></box>

        <box [flexDirection]="'row'" [height]="1" [width]="inputBoxWidth()">
          <box [flexGrow]="1"></box>
          <text [bold]="true" [fg]="'white'">tab</text>
          <text [dim]="true" [fg]="'gray'"> agents  </text>
          <text [bold]="true" [fg]="'white'">ctrl+p</text>
          <text [dim]="true" [fg]="'gray'"> commands</text>
        </box>
      </box>

      <box *ngIf="showModelSelector()"
           [flexDirection]="'column'"
           [position]="'absolute'"
           [positionTop]="0"
           [positionLeft]="0"
           [width]="termWidth()"
           [height]="termHeight()">
        <model-selector [groups]="modelGroups"
                        [activeModel]="currentModel()"
                        [onSelect]="selectModelFn"
                        [onClose]="closeModelSelectorFn">
        </model-selector>
      </box>

      <box [flexDirection]="'row'" [height]="1">
        <text [fg]="'white'" [bg]="'#1a2a2e'">{{ statusLeft() }}</text>
        <box [flexGrow]="1" [height]="1"></box>
        <text [fg]="'cyan'" [bg]="'#1a2a2e'">{{ version }}</text>
      </box>
    </box>
  `,
})
export class AppComponent implements OnInit {
  logo = LOGO;
  placeholder = 'Ask anything... "Fix broken tests"';
  version = '1.3.17';
  modelGroups = MODEL_GROUPS;
  autocompleteSelectedStyle = { bg: 'cyan', fg: 'black', bold: true };

  private _inputValue = signal('');
  private _currentModel = signal('GLM-4.6');
  private _provider = signal('Build');
  private _planName = signal('Z.AI Coding Plan');
  private _showModelSelector = signal(false);
  private _isInputFocused = signal(true);
  private _autocompleteIndex = signal(0);
  private _gitBranch = '';

  inputValue = () => this._inputValue();
  currentModel = () => this._currentModel();
  provider = () => this._provider();
  planName = () => this._planName();
  showModelSelector = () => this._showModelSelector();
  isInputFocused = () => this._isInputFocused();
  autocompleteIndex = () => this._autocompleteIndex();

  termWidth = () => process.stdout.columns || 80;
  termHeight = () => process.stdout.rows || 24;

  inputBoxWidth = () => {
    const cols = this.termWidth();
    return Math.min(Math.max(50, Math.floor(cols * 0.5)), cols - 4);
  };

  showAutocomplete = () => {
    const val = this._inputValue();
    return val.startsWith('/') && val.length > 0 && !this._showModelSelector();
  };

  filteredCommands = (): SlashCommand[] => {
    const val = this._inputValue().toLowerCase();
    return COMMANDS.filter((cmd) => cmd.name.toLowerCase().startsWith(val));
  };

  autocompleteItems = (): string[] => {
    return this.filteredCommands().map((cmd) => {
      const padded = cmd.name.padEnd(14);
      return `${padded}${cmd.description}`;
    });
  };

  autocompleteListHeight = () => {
    return Math.min(this.filteredCommands().length, 5);
  };

  inputBoxHeight = () => {
    if (this.showAutocomplete()) {
      const listH = this.autocompleteListHeight();
      return listH + 3; // list + input + spacer + model
    }
    return 4; // topSpacer + input + spacer + model
  };

  statusLeft = () => {
    const cwd = process.cwd();
    const branch = this._gitBranch;
    return branch ? ` ${cwd}:${branch} ` : ` ${cwd} `;
  };

  // Bound functions for child component callbacks
  selectModelFn = (model: string) => {
    this._currentModel.set(model);
    for (const group of MODEL_GROUPS) {
      if (group.models.includes(model)) {
        this._planName.set(group.name);
        break;
      }
    }
    this._showModelSelector.set(false);
    this._isInputFocused.set(true);
  };

  closeModelSelectorFn = () => {
    this._showModelSelector.set(false);
    this._isInputFocused.set(true);
  };

  ngOnInit(): void {
    this._gitBranch = getGitBranch();
  }

  onKeypress(event: { key: string; ctrl: boolean }) {
    if (event.ctrl && event.key === 'c') {
      process.exit(0);
    }

    if (this._showModelSelector()) {
      return;
    }

    // Handle autocomplete navigation
    if (this.showAutocomplete()) {
      if (event.key === 'up') {
        this._autocompleteIndex.update((i) => Math.max(0, i - 1));
        return;
      }
      if (event.key === 'down') {
        const max = this.filteredCommands().length - 1;
        this._autocompleteIndex.update((i) => Math.min(max, i + 1));
        return;
      }
      if (event.key === 'tab' || event.key === 'return') {
        const cmds = this.filteredCommands();
        const idx = this._autocompleteIndex();
        if (cmds[idx]) {
          const cmdName = cmds[idx].name;
          // Execute the command
          if (cmdName === '/models') {
            this._inputValue.set('');
            this._showModelSelector.set(true);
            this._isInputFocused.set(false);
            this._autocompleteIndex.set(0);
            return;
          }
          this._inputValue.set(cmdName);
          this._autocompleteIndex.set(0);
        }
        return;
      }
      if (event.key === 'escape') {
        this._inputValue.set('');
        this._autocompleteIndex.set(0);
        return;
      }
    }

    if (event.key === 'tab') {
      return;
    }

    if (event.key === 'return') {
      const val = this._inputValue().trim();
      if (val === '/models') {
        this._inputValue.set('');
        this._showModelSelector.set(true);
        this._isInputFocused.set(false);
        return;
      }
      if (val) {
        this._inputValue.set('');
      }
      return;
    }

    if (event.key === 'backspace') {
      this._inputValue.update((v) => v.slice(0, -1));
      this._autocompleteIndex.set(0);
      return;
    }

    if (event.key.length === 1 && !event.ctrl) {
      this._inputValue.update((v) => v + event.key);
      this._autocompleteIndex.set(0);
    }
  }
}
