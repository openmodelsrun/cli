import type { ResolvedConfig } from '../config/types.js';
import { NotFoundError, RateLimitError, NetworkError } from './errors.js';

export interface OpenModelsClientInterface {
  getModels(opts?: Record<string, unknown>): Promise<unknown>;
  getModel(id: string): Promise<unknown>;
  getProviders(opts?: Record<string, unknown>): Promise<unknown>;
  compareProviders(modelId: string, sort?: string): Promise<unknown>;
  searchModels(query: string, opts?: Record<string, unknown>): Promise<unknown>;
  getProviderHealth(providerId: string, opts?: Record<string, unknown>): Promise<unknown>;
  getProviderLatency(providerId: string, opts?: Record<string, unknown>): Promise<unknown>;
}

/**
 * Built-in HTTP client for the OpenModels API.
 * No external SDK dependency required.
 */
class HttpClient implements OpenModelsClientInterface {
  private baseUrl: string;
  private apiKey?: string;

  constructor(opts: { baseUrl: string; apiKey?: string }) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.apiKey = opts.apiKey;
  }

  async getModels(opts?: Record<string, unknown>): Promise<unknown> {
    const params = this.buildParams(opts);
    return this.request(`/api/models${params}`);
  }

  async getModel(id: string): Promise<unknown> {
    return this.request(`/api/models/${encodeURIComponent(id)}`);
  }

  async getProviders(opts?: Record<string, unknown>): Promise<unknown> {
    const params = this.buildParams(opts);
    return this.request(`/api/providers${params}`);
  }

  async compareProviders(modelId: string, sort?: string): Promise<unknown> {
    const params = sort ? `?sort_by=${encodeURIComponent(sort)}` : '';
    return this.request(`/api/models/${encodeURIComponent(modelId)}/compare${params}`);
  }

  async searchModels(query: string, opts?: Record<string, unknown>): Promise<unknown> {
    const merged = { ...opts, search: query };
    const params = this.buildParams(merged);
    return this.request(`/api/models${params}`);
  }

  async getProviderHealth(providerId: string, opts?: Record<string, unknown>): Promise<unknown> {
    const params = this.buildParams(opts);
    return this.request(`/api/providers/${encodeURIComponent(providerId)}/health${params}`);
  }

  async getProviderLatency(providerId: string, opts?: Record<string, unknown>): Promise<unknown> {
    const params = this.buildParams(opts);
    return this.request(`/api/providers/${encodeURIComponent(providerId)}/latency${params}`);
  }

  private buildParams(opts?: Record<string, unknown>): string {
    if (!opts || Object.keys(opts).length === 0) return '';
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(opts)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
    const str = params.toString();
    return str ? `?${str}` : '';
  }

  private async request(path: string): Promise<unknown> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'openmodels-cli',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    let response: Response;
    try {
      response = await fetch(url, { headers });
    } catch (err) {
      throw new NetworkError(
        'Unable to reach the OpenModels API. Check your network connection.',
        err instanceof Error ? err : undefined,
      );
    }

    if (!response.ok) {
      const body = await response.text();
      let message = `API error: ${response.status} ${response.statusText}`;
      let timestamp: string | undefined;
      try {
        const json = JSON.parse(body);
        if (json.message) message = json.message;
        if (json.timestamp) timestamp = json.timestamp;
      } catch {
        // use default message
      }

      if (response.status === 404) {
        throw new NotFoundError(message, timestamp);
      }
      if (response.status === 429) {
        throw new RateLimitError(message, undefined, timestamp);
      }
      throw new Error(message);
    }

    return response.json();
  }
}

export function createClient(config: ResolvedConfig): OpenModelsClientInterface {
  return new HttpClient({
    baseUrl: config.apiUrl,
    apiKey: config.apiKey,
  });
}
