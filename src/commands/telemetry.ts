import type { Command } from 'commander';
import { resolveConfig } from '../config/loader.js';
import { createClient } from '../utils/client.js';
import { createSpinner } from '../ui/spinner.js';
import { output, type TableColumn } from '../formatters/index.js';
import { handleError } from '../utils/errors.js';
import { getColors } from '../ui/colors.js';

interface HealthMetrics {
  status: string;
  uptime_percentage: number;
}

interface LatencyMetrics {
  avg_ttft: number;
  avg_response_time: number;
  p95_ttft: number;
  p95_response_time: number;
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

        const statusDisplay = health.status === 'up'
          ? colors.green('● UP')
          : colors.red('● DOWN');

        const rows: TelemetryRow[] = [
          { metric: 'Status', value: statusDisplay },
          { metric: 'Uptime', value: `${health.uptime_percentage.toFixed(2)}%` },
          { metric: 'Avg TTFT', value: `${latency.avg_ttft.toFixed(2)} ms` },
          { metric: 'Avg Response Time', value: `${latency.avg_response_time.toFixed(2)} ms` },
          { metric: 'P95 TTFT', value: `${latency.p95_ttft.toFixed(2)} ms` },
          { metric: 'P95 Response Time', value: `${latency.p95_response_time.toFixed(2)} ms` },
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
