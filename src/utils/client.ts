import { createRequire } from 'node:module';
import type { ResolvedConfig } from '../config/types.js';

export interface OpenModelsClientInterface {
  getModels(opts?: Record<string, unknown>): Promise<unknown>;
  getModel(id: string): Promise<unknown>;
  getProviders(opts?: Record<string, unknown>): Promise<unknown>;
  compareProviders(modelId: string, sort?: string): Promise<unknown>;
  searchModels(query: string, opts?: Record<string, unknown>): Promise<unknown>;
  getProviderHealth(providerId: string, opts?: Record<string, unknown>): Promise<unknown>;
  getProviderLatency(providerId: string, opts?: Record<string, unknown>): Promise<unknown>;
}

export function createClient(config: ResolvedConfig): OpenModelsClientInterface {
  const require = createRequire(import.meta.url);

  let sdk: { OpenModelsClient: new (opts: { baseUrl: string; apiKey?: string }) => OpenModelsClientInterface };
  try {
    sdk = require('@openmodels/sdk') as typeof sdk;
  } catch {
    console.error(
      'Error: @openmodels/sdk is not installed.\n' +
      'Install it with: npm install @openmodels/sdk\n'
    );
    process.exit(1);
  }

  return new sdk.OpenModelsClient({
    baseUrl: config.apiUrl,
    apiKey: config.apiKey,
  });
}
