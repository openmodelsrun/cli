import type { Command } from 'commander';
import { resolveConfig } from '../config/loader.js';
import { createClient } from '../utils/client.js';
import { createSpinner } from '../ui/spinner.js';
import { output, type TableColumn } from '../formatters/index.js';
import { handleError } from '../utils/errors.js';

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
        const rows = (await client.compareProviders(modelId, opts.sort)) as ComparisonRow[];
        spinner.stop();

        const sorted = sortRows(rows, opts.sort);
        output(sorted, config.format, compareColumns);
      } catch (error) {
        spinner.stop();
        handleError(error, cmd.optsWithGlobals().verbose ?? false);
      }
    });
}
