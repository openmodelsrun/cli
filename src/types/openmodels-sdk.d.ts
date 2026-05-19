declare module '@openmodels/sdk' {
  export interface OpenModelsClientOptions {
    baseUrl?: string;
    apiKey?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  }

  export class OpenModelsClient {
    constructor(options?: OpenModelsClientOptions);
    getModels(params?: Record<string, unknown>): Promise<unknown>;
    getModel(id: string): Promise<unknown>;
    getModelProviders(modelId: string): Promise<unknown>;
    compareProviders(modelId: string, sortBy?: string): Promise<unknown>;
    getRankedProviders(modelId: string, minUptime?: number): Promise<unknown>;
    getProviders(params?: Record<string, unknown>): Promise<unknown>;
    getProvider(id: string): Promise<unknown>;
    getProviderHealth(id: string, params?: Record<string, unknown>): Promise<unknown>;
    getProviderLatency(id: string, params?: Record<string, unknown>): Promise<unknown>;
    getHealth(): Promise<unknown>;
  }

  export class OpenModelsError extends Error {
    constructor(message: string);
  }

  export class ApiError extends OpenModelsError {
    readonly statusCode: number;
    readonly errorCode: string;
    readonly timestamp: string;
    constructor(statusCode: number, message: string, errorCode?: string, timestamp?: string);
    get isClientError(): boolean;
  }

  export class NotFoundError extends ApiError {
    constructor(message: string, timestamp?: string);
  }

  export class RateLimitError extends ApiError {
    readonly retryAfterMs: number | null;
    constructor(message: string, retryAfterMs?: number, timestamp?: string);
  }

  export class TimeoutError extends OpenModelsError {
    readonly timeoutMs: number;
    constructor(timeoutMs: number);
  }

  export class NetworkError extends OpenModelsError {
    readonly cause: Error | undefined;
    constructor(message: string, cause?: Error);
  }

  export default OpenModelsClient;
}
