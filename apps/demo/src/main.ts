import 'reflect-metadata';
import { bootstrapTerminalApplication } from '@ng-tui/platform-terminal';
import { AppComponent } from './app.component.js';
import { SystemInfoService } from './services/system-info.service.js';

bootstrapTerminalApplication(AppComponent, {
  providers: [SystemInfoService],
  terminal: { alternateBuffer: true },
}).catch((err) => {
  console.error('Failed to start demo:', err);
  process.exit(1);
});
