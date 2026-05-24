import type { Command } from 'commander';
import { resolveConfig } from '../config/loader.js';
import { createClient } from '../utils/client.js';
import { createSpinner } from '../ui/spinner.js';
import { output, type TableColumn } from '../formatters/index.js';
import { handleError } from '../utils/errors.js';

interface ApiCompareResponse {
  model_id: string;
  model_name: string;
  providers: ApiCompareProvider[];
  lowest_input_price: number;
  lowest_output_price: number;
}

interface ApiCompareProvider {
  provider_id: string;
  provider_name: string;
  pricing: {
    currency: string;
    input_per_million: number;
    output_per_million: number;
    cache_read_per_million?: number;
    cache_write_per_million?: number;
  };
  rate_limits: {
    tokens_per_minute: number;
    requests_per_minute: number;
  };
  context_window: number;
  uptime_24h: number;
  avg_ttft_ms: number;
  total_cost_estimate: number;
}

interface ComparisonRow {
  provider_name: string;
  input_price: number;
  output_price: number;
  rate_limits: string;
  regions: string[];
}

const compareColumns: TableColumn<ComparisonRow>[] = [
  {
    header: 'Provider',
    accessor: (row) => row.provider_name,
  },
  {
    header: 'Input Price (per 1M tokens)',
    accessor: (row) => `$${row.input_price.toFixed(2)}`,
    align: 'right',
  },
  {
    header: 'Output Price (per 1M tokens)',
    accessor: (row) => `$${row.output_price.toFixed(2)}`,
    align: 'right',
  },
  {
    header: 'Rate Limits',
    accessor: (row) => row.rate_limits,
  },
  {
    header: 'Regions',
    accessor: (row) => row.regions.join(', '),
  },
];

function sortRows(rows: ComparisonRow[], sortBy: string): ComparisonRow[] {
  const sorted = [...rows];
  switch (sortBy) {
    case 'rate_limit':
      sorted.sort((a, b) => a.rate_limits.localeCompare(b.rate_limits));
      break;
    case 'price':
    default:
      sorted.sort((a, b) => a.input_price - b.input_price);
      break;
  }
  return sorted;
}

export function registerCompareCommand(program: Command): void {
  program
    .command('compare <model-id>')
    .description('Compare providers for a model by price, rate limits, and regions')
    .option('--sort <field>', 'Sort by: price, rate_limit', 'price')
    .action(async (modelId: string, opts: { sort: string }, cmd: Command) => {
      const config = resolveConfig(cmd.optsWithGlobals());
      const client = createClient(config);
      const spinner = await createSpinner('Comparing providers...');

      try {
        spinner.start();
        const response = (await client.compareProviders(modelId, opts.sort)) as ApiCompareResponse;
        spinner.stop();

        const rows: ComparisonRow[] = (response.providers ?? []).map((p) => ({
          provider_name: p.provider_name,
          input_price: p.pricing.input_per_million,
          output_price: p.pricing.output_per_million,
          rate_limits: `${p.rate_limits.requests_per_minute} RPM / ${p.rate_limits.tokens_per_minute} TPM`,
          regions: [],
        }));

        const sorted = sortRows(rows, opts.sort);
        output(sorted, config.format, compareColumns);
      } catch (error) {
        spinner.stop();
        handleError(error, cmd.optsWithGlobals().verbose ?? false);
      }
    });
}
