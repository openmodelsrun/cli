import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('checkNodeVersion', () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;
  const originalVersion = process.version;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    exitSpy.mockRestore();
    stderrSpy.mockRestore();
    Object.defineProperty(process, 'version', { value: originalVersion, writable: true });
    vi.resetModules();
  });

  it('should pass silently when Node.js major version is 22', async () => {
    Object.defineProperty(process, 'version', { value: 'v22.0.0', writable: true });
    const { checkNodeVersion } = await import('../../../src/utils/version-check.js');
    checkNodeVersion();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('should pass silently when Node.js major version is above 22', async () => {
    Object.defineProperty(process, 'version', { value: 'v23.1.0', writable: true });
    const { checkNodeVersion } = await import('../../../src/utils/version-check.js');
    checkNodeVersion();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('should exit with code 1 when Node.js major version is below 22', async () => {
    Object.defineProperty(process, 'version', { value: 'v20.11.0', writable: true });
    const { checkNodeVersion } = await import('../../../src/utils/version-check.js');
    checkNodeVersion();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should print error message to stderr with the found version', async () => {
    Object.defineProperty(process, 'version', { value: 'v18.19.1', writable: true });
    const { checkNodeVersion } = await import('../../../src/utils/version-check.js');
    checkNodeVersion();
    expect(stderrSpy).toHaveBeenCalledWith(
      'Error: Node.js ≥22.0.0 required (found v18.19.1).\n',
    );
  });

  it('should not print anything to stderr when version is sufficient', async () => {
    Object.defineProperty(process, 'version', { value: 'v22.5.0', writable: true });
    const { checkNodeVersion } = await import('../../../src/utils/version-check.js');
    checkNodeVersion();
    expect(stderrSpy).not.toHaveBeenCalled();
  });
});
