import { Command, Option } from 'commander';
import { createRequire } from 'node:module';
import { registerSearchCommand } from './commands/search.js';
import { registerProvidersCommand } from './commands/providers.js';
import { registerModelsCommand } from './commands/models.js';
import { registerCompletionsCommand } from './commands/completions.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version: string };

export interface GlobalOptions {
  format: 'table' | 'json' | 'yaml';
  apiUrl: string;
  apiKey?: string;
  noColor: boolean;
  verbose: boolean;
}

export function createProgram(): Command {
  const program = new Command();

  program
    .name('openmodels')
    .description(
      'CLI for the OpenModels registry — browse models, compare providers, and check telemetry',
    )
    .version(pkg.version, '-v, --version');

  // Global options
  program.addOption(
    new Option('--format <type>', 'output format')
      .choices(['table', 'json', 'yaml'])
      .default('table'),
  );
  program.option('--api-url <url>', 'API base URL', 'https://api.openmodels.run');
  program.option('--api-key <key>', 'API key for authentication');
  program.option('--no-color', 'disable color output');
  program.option('--verbose', 'show detailed error output', false);

  // No-args behavior: display help
  program.action(() => {
    program.help();
  });

  // Register command groups
  registerModelsCommand(program);
  registerProvidersCommand(program);
  registerSearchCommand(program);
  registerCompletionsCommand(program);

  return program;
}
