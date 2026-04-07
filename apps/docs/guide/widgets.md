# Widgets & Layout

ng-tui provides built-in terminal widgets and a CSS-like flexbox layout engine powered by Yoga (WASM). No manual cursor math — just declare your layout and let the engine compute positions.

## Layout Engine

ng-tui uses [Yoga](https://yogalayout.dev/) for flexbox-based layout. All layout properties work the same as CSS flexbox.

### Flex Direction

```html
<box [flexDirection]="'column'">   <!-- top to bottom (default) -->
<box [flexDirection]="'row'">      <!-- left to right -->
```

### Flex Grow & Shrink

```html
<box [flexGrow]="1">              <!-- fill available space -->
<box [flexShrink]="0">            <!-- don't shrink -->
```

### Dimensions

```html
<box [width]="40" [height]="10">           <!-- fixed size -->
<box [width]="'100%'" [height]="'50%'">    <!-- percentage -->
<box [minWidth]="20" [maxWidth]="80">      <!-- constraints -->
```

### Padding & Margin

```html
<box [padding]="1">                        <!-- all sides -->
<box [padding.left]="2" [padding.right]="2">  <!-- individual sides -->
<box [margin.top]="1" [margin.bottom]="1">
```

### Gap

```html
<box [flexDirection]="'column'" [gap]="1">  <!-- space between children -->
```

### Full Layout Example

```html
<box [flexDirection]="'column'" [height]="'100%'" [width]="'100%'">
  <!-- Header: fixed height -->
  <box [height]="3" [borderStyle]="'single'">
    <text [style.bold]="true">My App</text>
  </box>

  <!-- Content: fills remaining space -->
  <box [flexGrow]="1" [flexDirection]="'row'" [gap]="1">
    <!-- Sidebar -->
    <box [width]="20" [borderStyle]="'rounded'">
      <text>Menu</text>
    </box>
    <!-- Main -->
    <box [flexGrow]="1" [borderStyle]="'rounded'">
      <text>Content</text>
    </box>
  </box>

  <!-- Footer: fixed height -->
  <box [height]="1">
    <text [style.color]="'gray'">Status bar</text>
  </box>
</box>
```

## Widgets

### box

The primary layout container. Supports borders, titles, and all flexbox properties.

```html
<box [borderStyle]="'rounded'"
     [title]="'My Panel'"
     [titleRight]="'v1.0'"
     [flexDirection]="'column'"
     [padding]="1">
  <!-- children -->
</box>
```

**Border styles:**

| Style | Example |
|---|---|
| `'none'` | No border |
| `'single'` | `┌─┐ │ │ └─┘` |
| `'double'` | `╔═╗ ║ ║ ╚═╝` |
| `'rounded'` | `╭─╮ │ │ ╰─╯` |
| `'bold'` | `┏━┓ ┃ ┃ ┗━┛` |

**Props:**

| Prop | Type | Description |
|---|---|---|
| `borderStyle` | `BorderStyle` | Border drawing style |
| `title` | `string` | Title displayed in top-left border |
| `titleRight` | `string` | Title displayed in top-right border |
| All layout props | — | `flexDirection`, `flexGrow`, `padding`, etc. |

### text

Renders styled text content.

```html
<text>Plain text</text>
<text [style.bold]="true">Bold text</text>
<text [style.color]="'cyan'" [style.dim]="true">Dim cyan text</text>
<text [textAlign]="'center'">Centered</text>
```

**Props:**

| Prop | Type | Description |
|---|---|---|
| `style.bold` | `boolean` | Bold text |
| `style.dim` | `boolean` | Dimmed text |
| `style.underline` | `boolean` | Underlined text |
| `style.color` | `string` | Foreground color (named or hex) |
| `style.bg` | `string` | Background color |
| `textAlign` | `'left' \| 'center' \| 'right'` | Text alignment |

**Supported colors:** All standard CSS named colors (`red`, `green`, `blue`, `cyan`, `magenta`, `yellow`, `gray`, `white`, `black`, etc.) and hex colors (`#ff0000`).

### input

An interactive text input field.

```html
<input [placeholder]="'Type here...'"
       [focus]="true"
       (submit)="onSubmit($event)">
</input>
```

**Props:**

| Prop | Type | Description |
|---|---|---|
| `value` | `string` | Current input value |
| `placeholder` | `string` | Placeholder text when empty |
| `focus` | `boolean` | Whether the input is focused |
| `cursorPosition` | `number` | Cursor position in text |

**Events:**

| Event | Payload | Description |
|---|---|---|
| `submit` | `string` | Fired when the user presses Enter |

### spinner

An animated loading spinner.

```html
<spinner>Loading...</spinner>
<spinner *ngIf="isProcessing()">Processing request...</spinner>
```

The spinner auto-animates through 10 frames.

### progress

A progress bar.

```html
<progress [value]="75" [showPercentage]="true"></progress>
```

**Props:**

| Prop | Type | Description |
|---|---|---|
| `value` | `number` | Progress value (0–100) |
| `showPercentage` | `boolean` | Show percentage label |

### list

A scrollable list of items.

```html
<list [items]="menuItems()"
      [selectedIndex]="selectedIndex()"
      [scrollOffset]="scrollOffset()">
</list>
```

**Props:**

| Prop | Type | Description |
|---|---|---|
| `items` | `string[]` | List items to display |
| `selectedIndex` | `number` | Currently selected item |
| `scrollOffset` | `number` | Scroll position |

### select

A dropdown-style selection widget.

```html
<select [options]="['Option A', 'Option B', 'Option C']"
        [selectedIndex]="selected()">
</select>
```

**Props:**

| Prop | Type | Description |
|---|---|---|
| `options` | `string[]` | Available options |
| `selectedIndex` | `number` | Currently selected option |

### table

A data table.

```html
<table [headers]="['Name', 'Status', 'CPU']"
       [rows]="tableData()"
       [columnWidths]="[20, 10, 10]">
</table>
```

**Props:**

| Prop | Type | Description |
|---|---|---|
| `headers` | `string[]` | Column headers |
| `rows` | `string[][]` | Row data (array of arrays) |
| `columnWidths` | `number[]` | Fixed column widths |
