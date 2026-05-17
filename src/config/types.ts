/**
 * Schema for the ~/.openmodelsrc configuration file.
 * Uses snake_case to match the JSON file format convention.
 */
export interface ConfigFile {
  api_url?: string;
  api_key?: string;
  format?: 'table' | 'json' | 'yaml';
  no_color?: boolean;
}

/**
 * Resolved runtime configuration after merging all sources.
 * Uses camelCase for internal TypeScript usage.
 */
export interface ResolvedConfig {
  apiUrl: string;
  apiKey?: string;
  format: 'table' | 'json' | 'yaml';
  noColor: boolean;
}
