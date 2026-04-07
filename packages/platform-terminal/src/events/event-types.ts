export interface KeyEvent {
  key: string;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
  raw: string;
}

export interface MouseEvent {
  x: number;
  y: number;
  button: 'left' | 'right' | 'middle' | 'scroll-up' | 'scroll-down';
}

export interface ResizeEvent {
  width: number;
  height: number;
}
