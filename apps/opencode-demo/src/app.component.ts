import { Component, type OnInit, signal } from '@ng-tui/core';
import { type ModelGroup, ModelSelectorComponent } from './components/model-selector.component.js';

const LOGO = [
  '  ___  _ __   ___ _ __   ___ ___   __| | ___ ',
  " / _ \\| '_ \\ / _ \\ '_ \\ / __/ _ \\ / _` |/ _ \\",
  '| (_) | |_) |  __/ | | | (_| (_) | (_| |  __/',
  ' \\___/| .__/ \\___|_| |_|\\___\\___/ \\__,_|\\___|',
  '      |_|                                     ',
].join('\n');

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
              [width]="48" [height]="5">{{ logo }}</text>

        <box [height]="1"></box>

        <box [flexDirection]="'column'"
             [width]="inputBoxWidth()"
             [height]="4"
             [borderStyle]="'rounded'"
             [borderFg]="'cyan'"
             [paddingLeft]="1"
             [paddingRight]="1"
             [paddingTop]="0"
             [paddingBottom]="0">

          <input [value]="inputValue()"
                 [placeholder]="placeholder"
                 [focus]="isInputFocused()"
                 [prompt]="''"
                 [height]="1" />

          <box [flexDirection]="'row'" [height]="1">
            <text [bold]="true" [fg]="'cyan'">{{ provider() }}</text>
            <text [dim]="true" [fg]="'gray'">  {{ currentModel() }}  {{ planName() }}</text>
          </box>
        </box>

        <box [height]="1"></box>

        <box [flexDirection]="'row'" [height]="1" [width]="inputBoxWidth()">
          <box [flexGrow]="1"></box>
          <text [dim]="true" [fg]="'gray'">tab</text>
          <text [dim]="true" [fg]="'white'"> agents  </text>
          <text [dim]="true" [fg]="'gray'">ctrl+p</text>
          <text [dim]="true" [fg]="'white'"> commands</text>
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
  placeholder = 'Ask anything... "What is the tech stack of this project?"';
  version = '1.0.0';
  modelGroups = MODEL_GROUPS;

  private _inputValue = signal('');
  private _currentModel = signal('Claude Opus 4.6');
  private _provider = signal('Build');
  private _planName = signal('Anthropic');
  private _showModelSelector = signal(false);
  private _isInputFocused = signal(true);

  inputValue = () => this._inputValue();
  currentModel = () => this._currentModel();
  provider = () => this._provider();
  planName = () => this._planName();
  showModelSelector = () => this._showModelSelector();
  isInputFocused = () => this._isInputFocused();

  termWidth = () => process.stdout.columns || 80;
  termHeight = () => process.stdout.rows || 24;

  inputBoxWidth = () => {
    const cols = this.termWidth();
    return Math.min(Math.max(50, Math.floor(cols * 0.5)), cols - 4);
  };

  statusLeft = () => {
    const cwd = process.cwd();
    return ` ${cwd} `;
  };

  // Bound functions for child component callbacks
  selectModelFn = (model: string) => {
    this._currentModel.set(model);
    // Determine provider from model name
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
    // Ready
  }

  onKeypress(event: { key: string; ctrl: boolean }) {
    // Ctrl+C to exit
    if (event.ctrl && event.key === 'c') {
      process.exit(0);
    }

    // Don't handle keys when model selector is open
    if (this._showModelSelector()) {
      return;
    }

    // Tab key - placeholder for agents menu
    if (event.key === 'tab') {
      return;
    }

    // Enter - submit or handle slash commands
    if (event.key === 'return') {
      const val = this._inputValue().trim();
      if (val === '/model') {
        this._inputValue.set('');
        this._showModelSelector.set(true);
        this._isInputFocused.set(false);
        return;
      }
      if (val) {
        // Placeholder: would send to AI here
        this._inputValue.set('');
      }
      return;
    }

    // Backspace
    if (event.key === 'backspace') {
      this._inputValue.update((v) => v.slice(0, -1));
      return;
    }

    // Regular character input
    if (event.key.length === 1 && !event.ctrl) {
      this._inputValue.update((v) => v + event.key);
    }
  }
}
