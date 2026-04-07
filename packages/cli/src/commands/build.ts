/**
 * ng-tui build — compile for distribution.
 */
export interface BuildCommandOptions {
  outDir?: string;
}

export async function buildCommand(_options: BuildCommandOptions = {}): Promise<void> {
  console.log('Building ng-tui project...');
  // TODO: Implement production build
}
