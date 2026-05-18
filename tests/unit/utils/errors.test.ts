import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  handleError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  TimeoutError,
  OpenModelsError,
} from '../../../src/utils/errors.js';

describe('handleError', () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    stderrSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  describe('NotFoundError', () => {
    it('should display user-friendly not found message', () => {
      const error = new NotFoundError('Model gpt-99 not found');
      handleError(error, false);

      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('Resource not found.'),
        'Model gpt-99 not found',
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should include error prefix indicator', () => {
      const error = new NotFoundError('Not found');
      handleError(error, false);

      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('✖'),
        expect.any(String),
      );
    });
  });

  describe('RateLimitError', () => {
    it('should display rate limit message with retry suggestion', () => {
      const error = new RateLimitError('Too many requests', 5000);
      handleError(error, false);

      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limited.'),
        'Please wait before retrying.',
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should use warning prefix for rate limit errors', () => {
      const error = new RateLimitError('Too many requests');
      handleError(error, false);

      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('⚠'),
        expect.any(String),
      );
    });
  });

  describe('NetworkError', () => {
    it('should display unreachable message with connectivity suggestion', () => {
      const error = new NetworkError('Connection refused');
      handleError(error, false);

      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('API unreachable.'),
        'Check your network connection.',
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('TimeoutError', () => {
    it('should display unreachable message for timeout', () => {
      const error = new TimeoutError(30000);
      handleError(error, false);

      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('API unreachable.'),
        'Check your network connection.',
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Unexpected errors', () => {
    it('should display generic message and suggest --verbose', () => {
      const error = new Error('Something went wrong');
      handleError(error, false);

      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unexpected error.'),
        'Use --verbose for details.',
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle non-Error objects', () => {
      handleError('string error', false);

      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unexpected error.'),
        'Use --verbose for details.',
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('exit code', () => {
    it('should always exit with code 1', () => {
      const errors = [
        new NotFoundError('not found'),
        new RateLimitError('rate limited'),
        new NetworkError('network error'),
        new TimeoutError(5000),
        new Error('unexpected'),
      ];

      for (const error of errors) {
        exitSpy.mockClear();
        handleError(error, false);
        expect(exitSpy).toHaveBeenCalledWith(1);
      }
    });
  });

  describe('verbose mode', () => {
    it('should print stack trace when verbose is true', () => {
      const error = new NotFoundError('Model not found');
      handleError(error, true);

      expect(stderrSpy).toHaveBeenCalledWith('\nStack trace:');
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('NotFoundError'));
    });

    it('should print API response details for ApiError subclasses', () => {
      const error = new NotFoundError('Model not found');
      handleError(error, true);

      expect(stderrSpy).toHaveBeenCalledWith('\nAPI Response:');
      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('"statusCode": 404'),
      );
    });

    it('should not print stack trace when verbose is false', () => {
      const error = new NotFoundError('Model not found');
      handleError(error, false);

      const calls = stderrSpy.mock.calls.flat().join(' ');
      expect(calls).not.toContain('Stack trace:');
    });

    it('should print verbose details for unexpected errors', () => {
      const error = new Error('Something broke');
      handleError(error, true);

      expect(stderrSpy).toHaveBeenCalledWith('\nStack trace:');
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('Something broke'));
    });
  });
});
