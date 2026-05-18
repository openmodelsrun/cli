import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatJson } from '../../../src/formatters/json.js';

describe('formatJson', () => {
  let writeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    writeSpy.mockRestore();
  });

  it('should output a simple object as formatted JSON', () => {
    const data = { name: 'gpt-4', id: 'gpt-4', context_window: 128000 };
    formatJson(data);

    const output = writeSpy.mock.calls[0]?.[0] as string;
    expect(JSON.parse(output)).toEqual(data);
    expect(output).toContain('  '); // 2-space indentation
  });

  it('should output an array as formatted JSON', () => {
    const data = [
      { id: 'model-a', name: 'Model A' },
      { id: 'model-b', name: 'Model B' },
    ];
    formatJson(data);

    const output = writeSpy.mock.calls[0]?.[0] as string;
    expect(JSON.parse(output)).toEqual(data);
  });

  it('should output a trailing newline', () => {
    formatJson({ key: 'value' });

    const output = writeSpy.mock.calls[0]?.[0] as string;
    expect(output.endsWith('\n')).toBe(true);
  });

  it('should handle empty arrays', () => {
    formatJson([]);

    const output = writeSpy.mock.calls[0]?.[0] as string;
    expect(JSON.parse(output)).toEqual([]);
  });

  it('should handle nested objects', () => {
    const data = {
      model: 'claude-opus-4',
      capabilities: ['text', 'vision'],
      pricing: { input: 15, output: 75 },
    };
    formatJson(data);

    const output = writeSpy.mock.calls[0]?.[0] as string;
    expect(JSON.parse(output)).toEqual(data);
  });
});
