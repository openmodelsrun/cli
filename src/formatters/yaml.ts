import { stringify } from 'yaml';

export function formatYaml<T>(data: T | T[]): void {
  const output = stringify(data);
  process.stdout.write(output);
}
