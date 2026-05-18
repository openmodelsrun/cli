import Table from 'cli-table3';
import { colors } from '../ui/colors.js';
import type { TableColumn } from './index.js';

export function renderTable<T>(data: T | T[], columns: TableColumn<T>[]): void {
  const items = Array.isArray(data) ? data : [data];

  if (items.length === 0) {
    console.log('No results found.');
    return;
  }

  const colWidths = columns
    .map((col) => col.width)
    .filter((w): w is number => w !== undefined);

  const table = new Table({
    head: columns.map((col) => colors.bold.cyan(col.header)),
    ...(colWidths.length === columns.length ? { colWidths } : {}),
    colAligns: columns.map((col) => col.align ?? 'left'),
    style: {
      head: [],
      border: [],
    },
  });

  for (const item of items) {
    const row = columns.map((col) => col.accessor(item));
    table.push(row);
  }

  console.log(table.toString());
}
