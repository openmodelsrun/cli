import { getColors } from '../ui/colors.js';

export class OpenModelsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenModelsError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ApiError extends OpenModelsError {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly timestamp: string;

  constructor(statusCode: number, message: string, errorCode?: string, timestamp?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode || 'UNKNOWN_ERROR';
    this.timestamp = timestamp || new Date().toISOString();
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string, timestamp?: string) {
    super(404, message, 'NOT_FOUND', timestamp);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ApiError {
  public readonly retryAfterMs: number | null;

  constructor(message: string, retryAfterMs?: number, timestamp?: string) {
    super(429, message, 'RATE_LIMITED', timestamp);
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs ?? null;
  }
}

export class TimeoutError extends OpenModelsError {
  public readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class NetworkError extends OpenModelsError {
  public readonly cause: Error | undefined;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

function isTTY(): boolean {
  return process.stderr.isTTY === true;
}

function errorPrefix(): string {
  const colors = getColors();
  if (isTTY()) {
    return colors.red('✖');
  }
  return '✖';
}

function warningPrefix(): string {
  const colors = getColors();
  if (isTTY()) {
    return colors.yellow('⚠');
  }
  return '⚠';
}

function printVerboseDetails(error: unknown): void {
  if (error instanceof Error && error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  if (error instanceof ApiError) {
    console.error('\nAPI Response:');
    console.error(JSON.stringify({
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      message: error.message,
      timestamp: error.timestamp,
    }, null, 2));
  }
}

/**
 * @param error - The error to handle
 * @param verbose - When true, appends full stack trace and raw API response
 */
export function handleError(error: unknown, verbose: boolean): never {
  if (error instanceof NotFoundError) {
    console.error(`${errorPrefix()} Error: Resource not found.`, error.message);
    if (verbose) printVerboseDetails(error);
    process.exit(1);
  }

  if (error instanceof RateLimitError) {
    console.error(`${warningPrefix()} Rate limited.`, 'Please wait before retrying.');
    if (verbose) printVerboseDetails(error);
    process.exit(1);
  }

  if (error instanceof NetworkError || error instanceof TimeoutError) {
    console.error(`${errorPrefix()} API unreachable.`, 'Check your network connection.');
    if (verbose) printVerboseDetails(error);
    process.exit(1);
  }

  console.error(`${errorPrefix()} Unexpected error.`, 'Use --verbose for details.');
  if (verbose) printVerboseDetails(error);
  process.exit(1);
}
