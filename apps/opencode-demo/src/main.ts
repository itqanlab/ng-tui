import 'reflect-metadata';
import { bootstrapTerminalApplication } from '@ng-tui/platform-terminal';
import { AppComponent } from './app.component.js';

bootstrapTerminalApplication(AppComponent, {
  terminal: { alternateBuffer: true },
}).catch((err) => {
  console.error('Failed to start opencode demo:', err);
  process.exit(1);
});
