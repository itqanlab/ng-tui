# Dashboard Example

A DevOps monitoring dashboard demonstrating complex layouts, multiple widgets, tables, progress bars, and real-time updates.

## What it looks like

```
╭─ System Dashboard ────────────────────────────────────╮
│ ╭─ Services ──────────╮ ╭─ Metrics ────────────────╮  │
│ │  ● API Gateway  UP  │ │ CPU   [████████░░]  78%  │  │
│ │  ● Auth Service UP  │ │ Mem   [██████░░░░]  62%  │  │
│ │  ● Database     UP  │ │ Disk  [████░░░░░░]  41%  │  │
│ │  ○ Worker      DOWN │ │ Net   [██░░░░░░░░]  23%  │  │
│ ╰─────────────────────╯ ╰──────────────────────────╯  │
│ ╭─ Recent Events ─────────────────────────────────╮   │
│ │  Time      Service        Event                 │   │
│ │  14:02     Worker         Connection lost       │   │
│ │  14:01     API Gateway    Request spike (+200%) │   │
│ │  13:58     Auth Service   Token refresh ok      │   │
│ │  13:55     Database       Backup completed      │   │
│ ╰─────────────────────────────────────────────────╯   │
╰───────────────────────────────────────────────────────╯
  q quit   r refresh   ↑↓ scroll events
```

## Implementation

### Services

```typescript
// services/monitor.service.ts
import { Injectable, signal, computed } from '@ng-tui/core';

interface ServiceStatus {
  name: string;
  status: 'up' | 'down' | 'degraded';
}

interface SystemMetric {
  name: string;
  value: number;
}

interface EventLog {
  time: string;
  service: string;
  event: string;
}

@Injectable()
class MonitorService {
  services = signal<ServiceStatus[]>([
    { name: 'API Gateway', status: 'up' },
    { name: 'Auth Service', status: 'up' },
    { name: 'Database', status: 'up' },
    { name: 'Worker', status: 'down' },
  ]);

  metrics = signal<SystemMetric[]>([
    { name: 'CPU', value: 78 },
    { name: 'Mem', value: 62 },
    { name: 'Disk', value: 41 },
    { name: 'Net', value: 23 },
  ]);

  events = signal<EventLog[]>([
    { time: '14:02', service: 'Worker', event: 'Connection lost' },
    { time: '14:01', service: 'API Gateway', event: 'Request spike (+200%)' },
    { time: '13:58', service: 'Auth Service', event: 'Token refresh ok' },
    { time: '13:55', service: 'Database', event: 'Backup completed' },
  ]);

  healthyCount = computed(() =>
    this.services().filter(s => s.status === 'up').length
  );

  totalServices = computed(() => this.services().length);
}
```

### Dashboard Component

```typescript
// app.component.ts
import { Component, OnInit, OnDestroy, signal } from '@ng-tui/core';

@Component({
  selector: 'app-root',
  template: `
    <box [flexDirection]="'column'" [height]="'100%'" [width]="'100%'">

      <!-- Main container -->
      <box [flexGrow]="1"
           [borderStyle]="'rounded'"
           [title]="'System Dashboard'"
           [flexDirection]="'column'"
           [padding]="1">

        <!-- Top row: Services + Metrics side by side -->
        <box [flexDirection]="'row'" [gap]="1" [height]="8">

          <!-- Services panel -->
          <box [borderStyle]="'rounded'"
               [title]="'Services'"
               [flexGrow]="1"
               [flexDirection]="'column'"
               [padding.left]="1">
            <text *ngFor="let svc of monitor.services()"
                  [style.color]="svc.status === 'up' ? 'green' : 'red'">
              {{ svc.status === 'up' ? '●' : '○' }} {{ svc.name }}  {{ svc.status | uppercase }}
            </text>
          </box>

          <!-- Metrics panel -->
          <box [borderStyle]="'rounded'"
               [title]="'Metrics'"
               [flexGrow]="1"
               [flexDirection]="'column'"
               [padding.left]="1">
            <box *ngFor="let m of monitor.metrics()" [flexDirection]="'row'">
              <text [style.color]="'white'">{{ m.name }}  </text>
              <progress [value]="m.value" [showPercentage]="true"></progress>
            </box>
          </box>
        </box>

        <!-- Events table -->
        <box [flexGrow]="1"
             [borderStyle]="'rounded'"
             [title]="'Recent Events'"
             [margin.top]="1">
          <table [headers]="['Time', 'Service', 'Event']"
                 [rows]="eventRows()"
                 [columnWidths]="[10, 18, 30]">
          </table>
        </box>
      </box>

      <!-- Status bar -->
      <box [height]="1" [padding.left]="1">
        <text [style.color]="'gray'">
          q quit   r refresh   ↑↓ scroll events
        </text>
      </box>
    </box>
  `
})
class DashboardComponent implements OnInit, OnDestroy {
  private refreshInterval?: ReturnType<typeof setInterval>;

  eventRows = signal<string[][]>([]);

  constructor(public monitor: MonitorService) {}

  ngOnInit() {
    this.updateEventRows();

    // Simulate real-time updates
    this.refreshInterval = setInterval(() => {
      this.monitor.metrics.update(metrics =>
        metrics.map(m => ({
          ...m,
          value: Math.min(100, Math.max(0, m.value + (Math.random() * 10 - 5)))
        }))
      );
    }, 2000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private updateEventRows() {
    this.eventRows.set(
      this.monitor.events().map(e => [e.time, e.service, e.event])
    );
  }
}
```

### Bootstrap

```typescript
// main.ts
import { bootstrapApplication } from '@ng-tui/core';
import { provideTerminal } from '@ng-tui/platform-terminal';

bootstrapApplication(DashboardComponent, {
  providers: [
    provideTerminal({ alternateBuffer: true }),
    MonitorService,
  ]
});
```

## What this demonstrates

| Feature | Usage |
|---|---|
| Complex layout | Nested flex rows/columns, fixed heights, `flexGrow` |
| Multiple widgets | `box`, `text`, `progress`, `table` |
| `@Injectable()` service | `MonitorService` with signals |
| `computed()` | Derived health count |
| `*ngFor` | Iterates services, metrics, events |
| Pipes | `\| uppercase` in template |
| Lifecycle hooks | `ngOnInit` for timer, `ngOnDestroy` for cleanup |
| Real-time updates | `setInterval` + `signal.update()` triggers re-render |
| DI | Service injected into component constructor |
