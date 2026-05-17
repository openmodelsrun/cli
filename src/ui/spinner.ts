import type { Ora } from 'ora';

const noopSpinner: Ora = {
  text: '',
  prefixText: '',
  suffixText: '',
  color: 'cyan',
  indent: 0,
  get spinner() {
    return { frames: [''], interval: 100 };
  },
  set spinner(_value) {
    // no-op
  },
  get isSpinning() {
    return false;
  },
  get interval() {
    return 100;
  },
  start() {
    return this;
  },
  stop() {
    return this;
  },
  succeed() {
    return this;
  },
  fail() {
    return this;
  },
  warn() {
    return this;
  },
  info() {
    return this;
  },
  stopAndPersist() {
    return this;
  },
  clear() {
    return this;
  },
  render() {
    return this;
  },
  frame() {
    return '';
  },
};

export async function createSpinner(text: string): Promise<Ora> {
  if (!process.stdout.isTTY) {
    return noopSpinner;
  }

  const ora = (await import('ora')).default;
  return ora(text);
}
