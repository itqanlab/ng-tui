import { Component, Input, type OnInit } from '@ng-tui/core';

export interface ModelGroup {
  name: string;
  models: string[];
}

@Component({
  selector: 'model-selector',
  template: `
    <box [flexDirection]="'column'"
         [position]="'absolute'"
         [positionTop]="4"
         [positionRight]="offsetRight()"
         [width]="50"
         [height]="modalHeight()"
         [borderStyle]="'rounded'"
         [borderFg]="'cyan'"
         [bg]="'#1a2a2e'"
         (keypress)="onKeypress($event)">

      <box [flexDirection]="'row'" [height]="1">
        <text [bold]="true" [fg]="'white'">Select model</text>
        <box [flexGrow]="1"></box>
        <text [dim]="true" [fg]="'gray'">esc</text>
      </box>

      <box [height]="1">
        <input [value]="searchText()"
               [placeholder]="'Search'"
               [focus]="true"
               [prompt]="''" />
      </box>

      <box [height]="1"></box>

      <list [items]="filteredDisplayItems()"
            [selectedIndex]="displaySelectedIndex()"
            [scrollOffset]="scrollOffset()"
            [height]="listHeight()"
            [selectedPrefix]="'  '"
            [prefix]="'  '"></list>

      <box [height]="1"></box>

      <box [flexDirection]="'row'" [height]="1">
        <text [bold]="true" [fg]="'cyan'">Connect provider</text>
        <text [dim]="true" [fg]="'gray'"> ctrl+a  </text>
        <text [bold]="true" [fg]="'cyan'">Favorite</text>
        <text [dim]="true" [fg]="'gray'"> ctrl+f</text>
      </box>
    </box>
  `,
})
export class ModelSelectorComponent implements OnInit {
  @Input() groups: ModelGroup[] = [];
  @Input() activeModel = '';
  @Input() onSelect: (model: string) => void = () => {};
  @Input() onClose: () => void = () => {};

  private _searchText = '';
  private _selectedFlatIndex = 0;
  private _scrollOffset = 0;

  searchText = () => this._searchText;
  scrollOffset = () => this._scrollOffset;

  offsetRight = () => {
    const cols = process.stdout.columns || 80;
    return Math.max(2, Math.floor((cols - 50) / 2));
  };

  modalHeight = () => {
    const rows = process.stdout.rows || 24;
    return Math.min(rows - 8, 30);
  };

  listHeight = () => {
    return this.modalHeight() - 8;
  };

  ngOnInit(): void {
    // Set initial selection to active model
    const items = this.buildFlatItems();
    const activeIdx = items.findIndex(
      (item) => item.type === 'model' && item.value === this.activeModel,
    );
    if (activeIdx >= 0) {
      this._selectedFlatIndex = activeIdx;
    }
  }

  private buildFlatItems(): { type: 'header' | 'model'; value: string; group?: string }[] {
    const items: { type: 'header' | 'model'; value: string; group?: string }[] = [];
    const search = this._searchText.toLowerCase();

    for (const group of this.groups) {
      const filtered = group.models.filter((m) => m.toLowerCase().includes(search));
      if (filtered.length === 0) continue;

      items.push({ type: 'header', value: group.name });
      for (const model of filtered) {
        items.push({ type: 'model', value: model, group: group.name });
      }
    }
    return items;
  }

  filteredDisplayItems = () => {
    const items = this.buildFlatItems();
    return items.map((item) => {
      if (item.type === 'header') {
        return `\x1b[1;36m${item.value}\x1b[0m`;
      }
      const isActive = item.value === this.activeModel;
      const marker = isActive ? '\x1b[36m● \x1b[0m' : '  ';
      return `${marker}${item.value}`;
    });
  };

  displaySelectedIndex = () => {
    return this._selectedFlatIndex;
  };

  onKeypress(event: { key: string; ctrl: boolean }) {
    const items = this.buildFlatItems();

    if (event.key === 'escape') {
      this.onClose();
      return;
    }

    if (event.key === 'return') {
      const item = items[this._selectedFlatIndex];
      if (item && item.type === 'model') {
        this.onSelect(item.value);
      }
      return;
    }

    if (event.key === 'up') {
      let next = this._selectedFlatIndex - 1;
      // Skip headers
      while (next >= 0 && items[next]?.type === 'header') next--;
      if (next >= 0) {
        this._selectedFlatIndex = next;
        this.adjustScroll();
      }
      return;
    }

    if (event.key === 'down') {
      let next = this._selectedFlatIndex + 1;
      while (next < items.length && items[next]?.type === 'header') next++;
      if (next < items.length) {
        this._selectedFlatIndex = next;
        this.adjustScroll();
      }
      return;
    }

    if (event.key === 'backspace') {
      this._searchText = this._searchText.slice(0, -1);
      this._selectedFlatIndex = this.findFirstModel();
      this._scrollOffset = 0;
      return;
    }

    // Regular character input for search
    if (event.key.length === 1 && !event.ctrl) {
      this._searchText += event.key;
      this._selectedFlatIndex = this.findFirstModel();
      this._scrollOffset = 0;
    }
  }

  private findFirstModel(): number {
    const items = this.buildFlatItems();
    return Math.max(
      0,
      items.findIndex((i) => i.type === 'model'),
    );
  }

  private adjustScroll(): void {
    const listH = this.listHeight();
    if (this._selectedFlatIndex < this._scrollOffset) {
      this._scrollOffset = this._selectedFlatIndex;
    } else if (this._selectedFlatIndex >= this._scrollOffset + listH) {
      this._scrollOffset = this._selectedFlatIndex - listH + 1;
    }
  }
}
