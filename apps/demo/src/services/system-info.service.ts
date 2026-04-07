import { Injectable, signal, computed } from '@ng-tui/core';

@Injectable()
export class SystemInfoService {
  readonly cpuUsage = signal(25);
  readonly memoryUsage = signal(40);
  readonly uptime = signal(0);
  readonly spinnerFrame = signal(0);
  readonly logs = signal<string[]>([
    `[${this.timestamp()}] System initialized`,
    `[${this.timestamp()}] All services online`,
  ]);

  readonly status = computed(() => {
    const cpu = this.cpuUsage();
    if (cpu > 80) return 'CRITICAL';
    if (cpu > 60) return 'WARNING';
    return 'HEALTHY';
  });

  readonly formattedUptime = computed(() => {
    const s = this.uptime();
    const hrs = String(Math.floor(s / 3600)).padStart(2, '0');
    const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const secs = String(s % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  });

  private timers: ReturnType<typeof setInterval>[] = [];

  start(): void {
    // Update uptime every second
    this.timers.push(
      setInterval(() => {
        this.uptime.update((v) => v + 1);
      }, 1000),
    );

    // Fluctuate CPU usage every 2 seconds
    this.timers.push(
      setInterval(() => {
        this.cpuUsage.update((v) => {
          const delta = Math.floor(Math.random() * 21) - 10;
          return Math.max(5, Math.min(95, v + delta));
        });
      }, 2000),
    );

    // Fluctuate memory usage every 3 seconds
    this.timers.push(
      setInterval(() => {
        this.memoryUsage.update((v) => {
          const delta = Math.floor(Math.random() * 11) - 5;
          return Math.max(20, Math.min(90, v + delta));
        });
      }, 3000),
    );

    // Add log entries periodically
    this.timers.push(
      setInterval(() => {
        const messages = [
          'Health check passed',
          'Metrics collected',
          'Cache cleared',
          'Connection pool refreshed',
          'Heartbeat received',
          'Garbage collection completed',
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        this.logs.update((l) => [...l.slice(-8), `[${this.timestamp()}] ${msg}`]);
      }, 4000),
    );

    // Spinner animation frame
    this.timers.push(
      setInterval(() => {
        this.spinnerFrame.update((f) => f + 1);
      }, 80),
    );
  }

  stop(): void {
    for (const t of this.timers) {
      clearInterval(t);
    }
    this.timers = [];
  }

  clearLogs(): void {
    this.logs.set([`[${this.timestamp()}] Logs cleared`]);
  }

  private timestamp(): string {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }
}
