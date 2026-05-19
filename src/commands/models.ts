import type { Command } from 'commander';
import { resolveConfig } from '../config/loader.js';
import { createClient } from '../utils/client.js';
import { createSpinner } from '../ui/spinner.js';
import { output, type TableColumn } from '../formatters/index.js';
import { handleError } from '../utils/errors.js';
import { getColors } from '../ui/colors.js';

interface Model {
  id: string;
  name: string;
  description?: string;
  capabilities?: string[];
  modalities?: string[];
  context_window?: number;
  license?: string;
}

interface ProviderPricing {
  provider_name?: string;
  provider_id?: string;
  input_price?: number;
  output_price?: number;
}

interface ModelDetail extends Model {
  providers?: ProviderPricing[];
}

interface PaginatedResponse {
  items: Model[];
  total?: number;
  page?: number;
  limit?: number;
}

const modelTableColumns: TableColumn<Model>[] = [
  { header: 'Name', accessor: (m) => m.name || '' },
  { header: 'ID', accessor: (m) => m.id || '' },
  {
    header: 'Context Window',
    accessor: (m) => (m.context_window ? m.context_window.toLocaleString() : '—'),
    align: 'right',
  },
  {
    header: 'Capabilities',
    accessor: (m) => (m.capabilities ? m.capabilities.join(', ') : '—'),
  },
];

export function registerModelsCommand(program: Command): void {
  const models = program.command('models').description('Browse and inspect models');

  models
    .command('list')
    .description('List models with optional filters')
    .option('--capability <cap>', 'Filter by capability')
    .option('--modality <mod>', 'Filter by modality')
    .option('--sort <field>', 'Sort by: name, recency, context_window, providers')
    .option('--page <n>', 'Page number', parseInt)
    .option('--limit <n>', 'Results per page', parseInt)
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const config = resolveConfig(globalOpts);
      const verbose = globalOpts.verbose ?? false;
      const client = createClient(config);
      const spinner = await createSpinner('Fetching models...');
      spinner.start();
      try {
        const params: Record<string, unknown> = {};
        if (opts.capability) params.capability = opts.capability;
        if (opts.modality) params.modality = opts.modality;
        if (opts.sort) params.sort = opts.sort;
        if (opts.page) params.page = opts.page;
        if (opts.limit) params.limit = opts.limit;

        const result = (await client.getModels(params)) as PaginatedResponse;
        spinner.stop();

        if (!result.items || result.items.length === 0) {
          console.log('No results found.');
          return;
        }

        output(result.items, config.format, modelTableColumns);
      } catch (error) {
        spinner.stop();
        handleError(error, verbose);
      }
    });

  models
    .command('info')
    .description('Display full details for a specific model')
    .argument('<model-id>', 'Model ID to inspect')
    .action(async (modelId: string, _opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const config = resolveConfig(globalOpts);
      const verbose = globalOpts.verbose ?? false;
      const client = createClient(config);
      const spinner = await createSpinner('Fetching model details...');
      spinner.start();
      try {
        const model = (await client.getModel(modelId)) as ModelDetail;
        spinner.stop();

        if (config.format !== 'table') {
          output(model, config.format);
          return;
        }

        // Display model details in a readable format
        const colors = getColors();
        console.log();
        console.log(colors.bold(model.name || model.id));
        if (model.description) {
          console.log(colors.dim(model.description));
        }
        console.log();
        console.log(`  ${'ID:'.padEnd(16)} ${model.id}`);
        if (model.capabilities && model.capabilities.length > 0) {
          console.log(`  ${'Capabilities:'.padEnd(16)} ${model.capabilities.join(', ')}`);
        }
        if (model.modalities && model.modalities.length > 0) {
          console.log(`  ${'Modalities:'.padEnd(16)} ${model.modalities.join(', ')}`);
        }
        if (model.context_window) {
          console.log(`  ${'Context Window:'.padEnd(16)} ${model.context_window.toLocaleString()} tokens`);
        }
        if (model.license) {
          console.log(`  ${'License:'.padEnd(16)} ${model.license}`);
        }

        // Provider pricing summary
        if (model.providers && model.providers.length > 0) {
          console.log();
          console.log(colors.bold('Providers'));
          console.log();

          const providerColumns: TableColumn<ProviderPricing>[] = [
            { header: 'Provider', accessor: (p) => p.provider_name || p.provider_id || '—' },
            {
              header: 'Input (per 1M tokens)',
              accessor: (p) => (p.input_price != null ? `$${p.input_price.toFixed(2)}` : '—'),
              align: 'right',
            },
            {
              header: 'Output (per 1M tokens)',
              accessor: (p) => (p.output_price != null ? `$${p.output_price.toFixed(2)}` : '—'),
              align: 'right',
            },
          ];

          output(model.providers, 'table', providerColumns);
        }
      } catch (error) {
        spinner.stop();
        handleError(error, verbose);
      }
    });
}
