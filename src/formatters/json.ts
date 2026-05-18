export function formatJson<T>(data: T | T[]): void {
  const output = JSON.stringify(data, null, 2);
  process.stdout.write(output + '\n');
}
