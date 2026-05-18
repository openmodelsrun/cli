import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parse } from 'yaml';
import { formatYaml } from '../../../src/formatters/yaml.js';

describe('formatYaml', () => {
  let writeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    writeSpy.mockRestore();
  });

  it('should output a simple object as YAML', () => {
    const data = { name: 'gpt-4', id: 'gpt-4', context_window: 128000 };
    formatYaml(data);

    const output = writeSpy.mock.calls[0]?.[0] as string;
    expect(parse(output)).toEqual(data);
  });

  it('should output an array as YAML', () => {
    const data = [
      { id: 'model-a', name: 'Model A' },
      { id: 'model-b', name: 'Model B' },
    ];
    formatYaml(data);

    const output = writeSpy.mock.calls[0]?.[0] as string;
    expect(parse(output)).toEqual(data);
  });

  it('should handle empty arrays', () => {
    formatYaml([]);

    const output = writeSpy.mock.calls[0]?.[0] as string;
    expect(parse(output)).toEqual([]);
  });

  it('should handle nested objects', () => {
    const data = {
      model: 'claude-opus-4',
      capabilities: ['text', 'vision'],
      pricing: { input: 15, output: 75 },
    };
    formatYaml(data);

    const output = writeSpy.mock.calls[0]?.[0] as string;
    expect(parse(output)).toEqual(data);
  });

  it('should produce valid YAML syntax', () => {
    const data = { key: 'value with: colons and "quotes"' };
    formatYaml(data);

    const output = writeSpy.mock.calls[0]?.[0] as string;
    // Should not throw when parsing
    expect(parse(output)).toEqual(data);
  });
});
