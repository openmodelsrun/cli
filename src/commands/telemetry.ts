import type { Command } from 'commander';
import { resolveConfig } from '../config/loader.js';
import { createClient } from '../utils/client.js';
import { createSpinner } from '../ui/spinner.js';
import { output, type TableColumn } from '../formatters/index.js';
import { handleError } from '../utils/errors.js';
import { getColors } from '../ui/colors.js';

interface HealthMetrics {
  provider_id: string;
  status: string;
  uptime_24h: number;
  uptime_7d: number;
  last_checked_at: string;
}

interface LatencyMetrics {
  provider_id: string;
  model_id: string;
  avg_ttft_ms: number;
  avg_total_time_ms: number;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
}

interface TelemetryRow {
  metric: string;
  value: string;
}

export function registerTelemetryCommand(program: Command): void {
  program
    .command('telemetry')
    .description('View telemetry data for a provider')
    .argument('<provider-id>', 'Provider ID to check telemetry for')
    .option('--period <period>', 'Time period: 1d, 7d, or 30d', '7d')
    .action(async (providerId: string, opts: { period: string }, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals();
      const config = resolveConfig(globalOpts);
      const client = createClient(config);
      const verbose = globalOpts.verbose ?? false;

      const spinner = await createSpinner('Fetching telemetry data...');
      spinner.start();

      try {
        const [healthData, latencyData] = await Promise.all([
          client.getProviderHealth(providerId, { period: opts.period }),
          client.getProviderLatency(providerId, { period: opts.period }),
        ]);

        spinner.stop();

        const health = healthData as HealthMetrics;
        const latency = latencyData as LatencyMetrics;
        const colors = getColors();

        const statusDisplay = health.status === 'healthy'
          ? colors.green('● UP')
          : colors.red('● DOWN');

        const rows: TelemetryRow[] = [
          { metric: 'Status', value: statusDisplay },
          { metric: 'Uptime (24h)', value: `${health.uptime_24h.toFixed(2)}%` },
          { metric: 'Uptime (7d)', value: `${health.uptime_7d.toFixed(2)}%` },
          { metric: 'Avg TTFT', value: `${latency.avg_ttft_ms.toFixed(2)} ms` },
          { metric: 'Avg Total Time', value: `${latency.avg_total_time_ms.toFixed(2)} ms` },
          { metric: 'P50 Latency', value: `${latency.p50_ms.toFixed(2)} ms` },
          { metric: 'P95 Latency', value: `${latency.p95_ms.toFixed(2)} ms` },
          { metric: 'P99 Latency', value: `${latency.p99_ms.toFixed(2)} ms` },
        ];

        const columns: TableColumn<TelemetryRow>[] = [
          { header: 'Metric', accessor: (row) => row.metric },
          { header: 'Value', accessor: (row) => row.value },
        ];

        output(rows, config.format, columns);
      } catch (error) {
        spinner.stop();
        handleError(error, verbose);
      }
    });
}
