import type { Command } from 'commander';
import { resolveConfig } from '../config/loader.js';
import { createClient } from '../utils/client.js';
import { createSpinner } from '../ui/spinner.js';
import { output, type TableColumn } from '../formatters/index.js';
import { handleError } from '../utils/errors.js';

interface SearchModel {
  name: string;
  id: string;
  capabilities: string[];
  context_window: number;
}

const searchTableColumns: TableColumn<SearchModel>[] = [
  { header: 'Name', accessor: (m) => m.name },
  { header: 'ID', accessor: (m) => m.id },
  { header: 'Capabilities', accessor: (m) => (m.capabilities ?? []).join(', ') },
  { header: 'Context Window', accessor: (m) => String(m.context_window ?? '') },
];

export function registerSearchCommand(program: Command): void {
  program
    .command('search <query>')
    .description('Search models by name or description')
    .option('--capability <cap>', 'Filter by capability')
    .option('--limit <n>', 'Maximum number of results', parseInt)
    .action(async (query: string, opts: { capability?: string; limit?: number }, cmd: Command) => {
      const config = resolveConfig(cmd.optsWithGlobals());
      const client = createClient(config);
      const spinner = await createSpinner('Searching models...');

      try {
        spinner.start();

        const params: Record<string, unknown> = { search: query };
        if (opts.capability) params.capability = opts.capability;
        if (opts.limit) params.limit = opts.limit;

        const result = (await client.getModels(params)) as {
          items?: SearchModel[];
          data?: SearchModel[];
        };

        spinner.stop();

        const items: SearchModel[] = result.items ?? result.data ?? [];

        if (items.length === 0) {
          console.log('No results found.');
          return;
        }

        output(items, config.format, searchTableColumns);
      } catch (error) {
        spinner.stop();
        handleError(error, cmd.optsWithGlobals().verbose ?? false);
      }
    });
}
