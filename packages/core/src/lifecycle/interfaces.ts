import type { SimpleChanges } from './changes.js';

/**
 * Called once after the component is initialized.
 */
export interface OnInit {
  ngOnInit(): void;
}

/**
 * Called when the component is destroyed.
 */
export interface OnDestroy {
  ngOnDestroy(): void;
}

/**
 * Called when @Input() properties change.
 */
export interface OnChanges {
  ngOnChanges(changes: SimpleChanges): void;
}

/**
 * Called after all child components are initialized.
 */
export interface AfterViewInit {
  ngAfterViewInit(): void;
}

/**
 * Interface for pipe transform method.
 */
export interface PipeTransform {
  transform(value: any, ...args: any[]): any;
}
