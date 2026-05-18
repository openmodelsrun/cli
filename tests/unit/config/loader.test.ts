import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

vi.mock('node:fs');
vi.mock('node:os');

const mockedReadFileSync = vi.mocked(readFileSync);
const mockedHomedir = vi.mocked(homedir);

describe('resolveConfig', () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    stderrSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedHomedir.mockReturnValue('/home/testuser');
    process.env = { ...originalEnv };
    delete process.env['OPENMODELS_API_URL'];
    delete process.env['OPENMODELS_API_KEY'];
  });

  afterEach(() => {
    stderrSpy.mockRestore();
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  async function loadResolveConfig() {
    const mod = await import('../../../src/config/loader.js');
    return mod.resolveConfig;
  }

  describe('defaults', () => {
    it('should return default values when no config file, env vars, or flags exist', async () => {
      mockedReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({});

      expect(config).toEqual({
        apiUrl: 'https://api.openmodels.run',
        format: 'table',
        noColor: false,
      });
    });

    it('should not include apiKey in defaults', async () => {
      mockedReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({});

      expect(config.apiKey).toBeUndefined();
    });
  });

  describe('config file reading', () => {
    it('should read config from ~/.openmodelsrc', async () => {
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({ api_url: 'https://custom.api.com', format: 'json' }),
      );

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({});

      expect(mockedReadFileSync).toHaveBeenCalledWith(
        join('/home/testuser', '.openmodelsrc'),
        'utf-8',
      );
      expect(config.apiUrl).toBe('https://custom.api.com');
      expect(config.format).toBe('json');
    });

    it('should apply all config file fields', async () => {
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({
          api_url: 'https://custom.api.com',
          api_key: 'om_file_key',
          format: 'yaml',
          no_color: true,
        }),
      );

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({});

      expect(config).toEqual({
        apiUrl: 'https://custom.api.com',
        apiKey: 'om_file_key',
        format: 'yaml',
        noColor: true,
      });
    });

    it('should silently use defaults when config file does not exist', async () => {
      mockedReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({});

      expect(stderrSpy).not.toHaveBeenCalled();
      expect(config.apiUrl).toBe('https://api.openmodels.run');
    });

    it('should warn to stderr and use defaults when config file has invalid JSON', async () => {
      mockedReadFileSync.mockReturnValue('{ invalid json content !!!');

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({});

      expect(stderrSpy).toHaveBeenCalledWith(
        'Warning: ~/.openmodelsrc contains invalid JSON. Using default configuration.',
      );
      expect(config.apiUrl).toBe('https://api.openmodels.run');
      expect(config.format).toBe('table');
      expect(config.noColor).toBe(false);
    });
  });

  describe('environment variables', () => {
    it('should use OPENMODELS_API_URL when set', async () => {
      mockedReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });
      process.env['OPENMODELS_API_URL'] = 'https://env.api.com';

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({});

      expect(config.apiUrl).toBe('https://env.api.com');
    });

    it('should use OPENMODELS_API_KEY when set', async () => {
      mockedReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });
      process.env['OPENMODELS_API_KEY'] = 'om_env_key';

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({});

      expect(config.apiKey).toBe('om_env_key');
    });

    it('should override config file values with environment variables', async () => {
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({ api_url: 'https://file.api.com', api_key: 'om_file_key' }),
      );
      process.env['OPENMODELS_API_URL'] = 'https://env.api.com';
      process.env['OPENMODELS_API_KEY'] = 'om_env_key';

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({});

      expect(config.apiUrl).toBe('https://env.api.com');
      expect(config.apiKey).toBe('om_env_key');
    });
  });

  describe('CLI flags precedence', () => {
    it('should override defaults with flags', async () => {
      mockedReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({
        apiUrl: 'https://flag.api.com',
        format: 'json',
        noColor: true,
      });

      expect(config.apiUrl).toBe('https://flag.api.com');
      expect(config.format).toBe('json');
      expect(config.noColor).toBe(true);
    });

    it('should override environment variables with flags', async () => {
      mockedReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });
      process.env['OPENMODELS_API_URL'] = 'https://env.api.com';
      process.env['OPENMODELS_API_KEY'] = 'om_env_key';

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({
        apiUrl: 'https://flag.api.com',
        apiKey: 'om_flag_key',
      });

      expect(config.apiUrl).toBe('https://flag.api.com');
      expect(config.apiKey).toBe('om_flag_key');
    });

    it('should override config file values with flags', async () => {
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({
          api_url: 'https://file.api.com',
          api_key: 'om_file_key',
          format: 'yaml',
          no_color: true,
        }),
      );

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({
        apiUrl: 'https://flag.api.com',
        apiKey: 'om_flag_key',
        format: 'json',
        noColor: false,
      });

      expect(config).toEqual({
        apiUrl: 'https://flag.api.com',
        apiKey: 'om_flag_key',
        format: 'json',
        noColor: false,
      });
    });

    it('should use full precedence: flags > env > file > defaults', async () => {
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({ api_url: 'https://file.api.com', format: 'yaml' }),
      );
      process.env['OPENMODELS_API_URL'] = 'https://env.api.com';

      const resolveConfig = await loadResolveConfig();
      // Flag overrides env which overrides file
      const config = resolveConfig({ apiUrl: 'https://flag.api.com' });

      expect(config.apiUrl).toBe('https://flag.api.com');
      // format comes from file since no env or flag for it
      expect(config.format).toBe('yaml');
    });
  });

  describe('partial flags', () => {
    it('should only override values for flags that are explicitly provided', async () => {
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({ api_url: 'https://file.api.com', format: 'yaml', no_color: true }),
      );

      const resolveConfig = await loadResolveConfig();
      // Only override format, leave other values from file
      const config = resolveConfig({ format: 'json' });

      expect(config.apiUrl).toBe('https://file.api.com');
      expect(config.format).toBe('json');
      expect(config.noColor).toBe(true);
    });

    it('should handle empty flags object', async () => {
      mockedReadFileSync.mockReturnValue(
        JSON.stringify({ api_url: 'https://file.api.com' }),
      );

      const resolveConfig = await loadResolveConfig();
      const config = resolveConfig({});

      expect(config.apiUrl).toBe('https://file.api.com');
    });
  });
});
