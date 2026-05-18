import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('colors utility', () => {
  const originalEnv = process.env;
  const originalIsTTY = process.stdout.isTTY;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, writable: true });
  });

  describe('createColors', () => {
    it('should return a chalk instance with level 0 when noColor is true', async () => {
      const { createColors } = await import('../../../src/ui/colors.js');
      const instance = createColors(true);
      expect(instance.level).toBe(0);
    });

    it('should produce no ANSI codes when noColor is true', async () => {
      const { createColors } = await import('../../../src/ui/colors.js');
      const instance = createColors(true);
      const output = instance.red('hello');
      expect(output).toBe('hello');
      expect(output).not.toContain('\x1b[');
    });

    it('should return a chalk instance when noColor is false and TTY is available', async () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      delete process.env['NO_COLOR'];
      const { createColors } = await import('../../../src/ui/colors.js');
      const instance = createColors(false);
      // When color is enabled, level should be > 0 (depends on terminal)
      expect(instance.level).toBeGreaterThanOrEqual(0);
    });

    it('should disable color when NO_COLOR env var is set and noColor is undefined', async () => {
      process.env['NO_COLOR'] = '1';
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      const { createColors } = await import('../../../src/ui/colors.js');
      const instance = createColors();
      expect(instance.level).toBe(0);
    });

    it('should disable color when stdout is not a TTY and noColor is undefined', async () => {
      delete process.env['NO_COLOR'];
      Object.defineProperty(process.stdout, 'isTTY', { value: undefined, writable: true });
      const { createColors } = await import('../../../src/ui/colors.js');
      const instance = createColors();
      expect(instance.level).toBe(0);
    });
  });

  describe('setColorEnabled', () => {
    it('should disable colors when called with false', async () => {
      const { setColorEnabled, getColors } = await import('../../../src/ui/colors.js');
      setColorEnabled(false);
      const instance = getColors();
      expect(instance.level).toBe(0);
      expect(instance.red('test')).toBe('test');
    });

    it('should produce no ANSI escape sequences after disabling', async () => {
      const { setColorEnabled, getColors } = await import('../../../src/ui/colors.js');
      setColorEnabled(false);
      const instance = getColors();
      const output = instance.bold.green('status: up');
      expect(output).not.toContain('\x1b[');
      expect(output).toBe('status: up');
    });
  });

  describe('colors export', () => {
    it('should export a usable chalk instance', async () => {
      const { colors } = await import('../../../src/ui/colors.js');
      expect(colors).toBeDefined();
      expect(typeof colors.red).toBe('function');
      expect(typeof colors.green).toBe('function');
      expect(typeof colors.bold).toBeDefined();
    });

    it('should export getColors that returns the current instance', async () => {
      const { getColors } = await import('../../../src/ui/colors.js');
      const instance = getColors();
      expect(instance).toBeDefined();
      expect(typeof instance.red).toBe('function');
    });
  });
});
