import { OpenModelsClient } from '@openmodels/sdk';
import type { ResolvedConfig } from '../config/types.js';

export function createClient(config: ResolvedConfig): OpenModelsClient {
  return new OpenModelsClient({
    baseUrl: config.apiUrl,
    apiKey: config.apiKey,
  });
}
