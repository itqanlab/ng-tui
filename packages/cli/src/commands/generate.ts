/**
 * ng-tui generate <schematic> <name> — generate boilerplate.
 */
export type Schematic = 'component' | 'service' | 'pipe';

export interface GenerateCommandOptions {
  schematic: Schematic;
  name: string;
  path?: string;
}

export async function generateCommand(options: GenerateCommandOptions): Promise<void> {
  console.log(`Generating ${options.schematic}: ${options.name}`);
  // TODO: Implement code generation
}
