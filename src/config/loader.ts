import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { GlobalOptions } from '../cli.js';
import type { ConfigFile, ResolvedConfig } from './types.js';

const DEFAULTS: ResolvedConfig = {
  apiUrl: 'https://api.openmodels.run',
  format: 'table',
  noColor: false,
};

/**
 * Reads and parses the ~/.openmodelsrc config file.
 * Returns undefined if the file doesn't exist.
 * Warns to stderr and returns undefined if the file contains invalid JSON.
 */
function readConfigFile(): ConfigFile | undefined {
  const configPath = join(homedir(), '.openmodelsrc');

  let content: string;
  try {
    content = readFileSync(configPath, 'utf-8');
  } catch {
    // File doesn't exist or isn't readable — silently use defaults
    return undefined;
  }

  try {
    return JSON.parse(content) as ConfigFile;
  } catch {
    console.error('Warning: ~/.openmodelsrc contains invalid JSON. Using default configuration.');
    return undefined;
  }
}

/**
 * Resolves configuration by merging sources with strict precedence:
 *   1. CLI flags (highest)
 *   2. Environment variables (OPENMODELS_API_URL, OPENMODELS_API_KEY)
 *   3. Config file (~/.openmodelsrc)
 *   4. Defaults (lowest)
 */
export function resolveConfig(flags: Partial<GlobalOptions>): ResolvedConfig {
  const configFile = readConfigFile();

  // Layer 3: Config file values (over defaults)
  const fromFile: Partial<ResolvedConfig> = {};
  if (configFile) {
    if (configFile.api_url !== undefined) fromFile.apiUrl = configFile.api_url;
    if (configFile.api_key !== undefined) fromFile.apiKey = configFile.api_key;
    if (configFile.format !== undefined) fromFile.format = configFile.format;
    if (configFile.no_color !== undefined) fromFile.noColor = configFile.no_color;
  }

  // Layer 2: Environment variables (over config file)
  const fromEnv: Partial<ResolvedConfig> = {};
  if (process.env['OPENMODELS_API_URL']) {
    fromEnv.apiUrl = process.env['OPENMODELS_API_URL'];
  }
  if (process.env['OPENMODELS_API_KEY']) {
    fromEnv.apiKey = process.env['OPENMODELS_API_KEY'];
  }

  // Layer 1: CLI flags (over everything)
  const fromFlags: Partial<ResolvedConfig> = {};
  if (flags.apiUrl !== undefined) fromFlags.apiUrl = flags.apiUrl;
  if (flags.apiKey !== undefined) fromFlags.apiKey = flags.apiKey;
  if (flags.format !== undefined) fromFlags.format = flags.format;
  if (flags.noColor !== undefined) fromFlags.noColor = flags.noColor;

  return {
    ...DEFAULTS,
    ...fromFile,
    ...fromEnv,
    ...fromFlags,
  };
}
