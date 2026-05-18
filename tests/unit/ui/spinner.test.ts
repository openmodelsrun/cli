import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('createSpinner', () => {
  const originalIsTTY = process.stdout.isTTY;

  afterEach(() => {
    Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, writable: true });
    vi.resetModules();
  });

  describe('when stdout is not a TTY (piped/non-interactive)', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: undefined, writable: true });
    });

    it('should return a no-op spinner', async () => {
      const { createSpinner } = await import('../../../src/ui/spinner.js');
      const spinner = await createSpinner('Loading...');

      expect(spinner.isSpinning).toBe(false);
    });

    it('should return a spinner with chainable no-op methods', async () => {
      const { createSpinner } = await import('../../../src/ui/spinner.js');
      const spinner = await createSpinner('Loading...');

      // All methods should return the spinner itself for chaining
      expect(spinner.start()).toBe(spinner);
      expect(spinner.stop()).toBe(spinner);
      expect(spinner.succeed()).toBe(spinner);
      expect(spinner.fail()).toBe(spinner);
      expect(spinner.warn()).toBe(spinner);
      expect(spinner.info()).toBe(spinner);
      expect(spinner.clear()).toBe(spinner);
      expect(spinner.render()).toBe(spinner);
      expect(spinner.stopAndPersist()).toBe(spinner);
    });

    it('should not produce any output', async () => {
      const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      const { createSpinner } = await import('../../../src/ui/spinner.js');
      const spinner = await createSpinner('Loading...');

      spinner.start();
      spinner.succeed('Done');
      spinner.stop();

      expect(writeSpy).not.toHaveBeenCalled();
      writeSpy.mockRestore();
    });
  });

  describe('when stdout is a TTY (interactive)', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
    });

    it('should return an ora spinner instance', async () => {
      const { createSpinner } = await import('../../../src/ui/spinner.js');
      const spinner = await createSpinner('Loading...');

      // ora spinner has these properties
      expect(spinner).toHaveProperty('start');
      expect(spinner).toHaveProperty('stop');
      expect(spinner).toHaveProperty('succeed');
      expect(spinner).toHaveProperty('fail');
      expect(spinner.text).toBe('Loading...');
    });
  });
});
