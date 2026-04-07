/**
 * ng-tui new <name> — scaffold a new ng-tui project.
 */
export interface NewCommandOptions {
  name: string;
  directory?: string;
}

export async function newCommand(options: NewCommandOptions): Promise<void> {
  console.log(`Creating new ng-tui project: ${options.name}`);
  // TODO: Implement project scaffolding
  // - Create directory
  // - Generate package.json, tsconfig.json, biome.json
  // - Generate src/main.ts and src/app.component.ts
  // - Install dependencies
}
