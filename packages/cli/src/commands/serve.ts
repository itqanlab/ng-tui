/**
 * ng-tui serve — run the app in dev mode with watch.
 */
export interface ServeCommandOptions {
  port?: number;
  watch?: boolean;
}

export async function serveCommand(_options: ServeCommandOptions = {}): Promise<void> {
  console.log('Starting ng-tui dev server...');
  // TODO: Implement dev server with hot reload
}
