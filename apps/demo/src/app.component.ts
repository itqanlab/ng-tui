import { Component, Inject, type OnInit, type OnDestroy } from '@ng-tui/core';
import { SystemInfoService } from './services/system-info.service.js';

@Component({
  selector: 'app-root',
  template: `
    <box [flexDirection]="'column'" (keypress)="onKeypress($event)">

      <box [borderStyle]="'rounded'"
           [title]="'ng-tui Dashboard'"
           [flexDirection]="'column'"
           [flexGrow]="1"
           [padding]="1">

        <text>CPU Usage</text>
        <progress [value]="cpuUsage()" [width]="40"></progress>
        <text>Memory Usage</text>
        <progress [value]="memoryUsage()" [width]="40"></progress>

        <text>Uptime: {{ formattedUptime() }}    Status: {{ status() | uppercase }}</text>

        <box *ngIf="isCritical()" [height]="1">
          <text>!! CPU usage is critical !!</text>
        </box>

        <box [borderStyle]="'single'"
             [title]="'Recent Logs'"
             [flexDirection]="'column'"
             [flexGrow]="1">
          <text *ngFor="let log of logs()">{{ log }}</text>
        </box>

        <text>{{ spinnerLabel() }}    [q] quit  [c] clear logs</text>

      </box>
    </box>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  private svc: SystemInfoService;

  constructor(@Inject(SystemInfoService) svc: SystemInfoService) {
    this.svc = svc;
  }

  cpuUsage = () => this.svc.cpuUsage();
  memoryUsage = () => this.svc.memoryUsage();
  formattedUptime = () => this.svc.formattedUptime();
  status = () => this.svc.status();
  logs = () => this.svc.logs();
  spinnerFrame = () => this.svc.spinnerFrame();
  isCritical = () => this.svc.cpuUsage() > 80;
  spinnerLabel = () => {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    return `${frames[this.svc.spinnerFrame() % frames.length]} Monitoring`;
  };

  ngOnInit(): void {
    this.svc.start();
  }

  ngOnDestroy(): void {
    this.svc.stop();
  }

  onKeypress(event: { key: string; ctrl: boolean }): void {
    if (event.key === 'q') {
      this.svc.stop();
      process.exit(0);
    }
    if (event.key === 'c') {
      this.svc.clearLogs();
    }
  }
}
