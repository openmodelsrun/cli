import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@openmodels/sdk', () => {
  const MockOpenModelsClient = vi.fn();
  return {
    OpenModelsClient: MockOpenModelsClient,
    default: MockOpenModelsClient,
  };
});

import { OpenModelsClient } from '@openmodels/sdk';
import { createClient } from '../../../src/utils/client.js';
import type { ResolvedConfig } from '../../../src/config/types.js';

describe('createClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an OpenModelsClient with baseUrl from config', () => {
    const config: ResolvedConfig = {
      apiUrl: 'https://api.openmodels.run',
      format: 'table',
      noColor: false,
    };

    createClient(config);

    expect(OpenModelsClient).toHaveBeenCalledWith({
      baseUrl: 'https://api.openmodels.run',
      apiKey: undefined,
    });
  });

  it('should pass apiKey when provided in config', () => {
    const config: ResolvedConfig = {
      apiUrl: 'https://api.openmodels.run',
      apiKey: 'om_test_key_123',
      format: 'json',
      noColor: true,
    };

    createClient(config);

    expect(OpenModelsClient).toHaveBeenCalledWith({
      baseUrl: 'https://api.openmodels.run',
      apiKey: 'om_test_key_123',
    });
  });

  it('should use custom apiUrl when provided', () => {
    const config: ResolvedConfig = {
      apiUrl: 'https://custom.api.example.com',
      apiKey: 'my-key',
      format: 'yaml',
      noColor: false,
    };

    createClient(config);

    expect(OpenModelsClient).toHaveBeenCalledWith({
      baseUrl: 'https://custom.api.example.com',
      apiKey: 'my-key',
    });
  });

  it('should return an OpenModelsClient instance', () => {
    const config: ResolvedConfig = {
      apiUrl: 'https://api.openmodels.run',
      format: 'table',
      noColor: false,
    };

    const client = createClient(config);

    expect(client).toBeDefined();
  });
});
