import type { Command } from 'commander';
import { resolveConfig } from '../config/loader.js';
import { createClient } from '../utils/client.js';
import { createSpinner } from '../ui/spinner.js';
import { output, type TableColumn } from '../formatters/index.js';
import { handleError } from '../utils/errors.js';

interface Provider {
  id: string;
  name: string;
  compatibility: string;
  regions: string[];
  model_count?: number;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

const providerTableColumns: TableColumn<Provider>[] = [
  { header: 'Name', accessor: (p) => p.name },
  { header: 'ID', accessor: (p) => p.id },
  { header: 'API Compatibility', accessor: (p) => p.compatibility ?? 'unknown' },
  { header: 'Regions', accessor: (p) => (p.regions ?? []).join(', ') || 'N/A' },
  { header: 'Model Count', accessor: (p) => String(p.model_count ?? 'N/A') },
];

export function registerProvidersCommand(program: Command): void {
  const providers = program.command('providers').description('Browse inference providers');

  providers
    .command('list')
    .description('List providers with optional filters')
    .option('--search <term>', 'Search providers by name')
    .option('--page <n>', 'Page number', parseInt)
    .option('--limit <n>', 'Results per page', parseInt)
    .action(async (opts, cmd) => {
      const config = resolveConfig(cmd.optsWithGlobals());
      const client = createClient(config);
      const spinner = await createSpinner('Fetching providers...');

      try {
        spinner.start();
        const params: Record<string, unknown> = {};
        if (opts.search !== undefined) params.search = opts.search;
        if (opts.page !== undefined) params.page = opts.page;
        if (opts.limit !== undefined) params.limit = opts.limit;

        const result = (await client.getProviders(params)) as PaginatedResponse<Provider>;
        spinner.stop();

        const items = result.items ?? [];
        if (items.length === 0) {
          console.log('No results found.');
          return;
        }

        output(items, config.format, providerTableColumns);
      } catch (error) {
        spinner.stop();
        handleError(error, cmd.optsWithGlobals().verbose ?? false);
      }
    });
}
