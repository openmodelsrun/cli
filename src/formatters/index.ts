import { formatJson } from './json.js';
import { formatYaml } from './yaml.js';
import { renderTable } from './table.js';

export type OutputFormat = 'table' | 'json' | 'yaml';

export interface TableColumn<T> {
  header: string;
  accessor: (item: T) => string;
  width?: number;
  align?: 'left' | 'right' | 'center';
}

export function output<T>(data: T | T[], format: OutputFormat, columns?: TableColumn<T>[]): void {
  switch (format) {
    case 'json':
      formatJson(data);
      break;
    case 'yaml':
      formatYaml(data);
      break;
    case 'table':
    default:
      if (!columns) {

        formatJson(data);
        return;
      }
      renderTable(data, columns);
      break;
  }
}
