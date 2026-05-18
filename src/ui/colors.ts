import chalk, { Chalk, type ChalkInstance } from 'chalk';

function shouldDisableColor(): boolean {
  if (process.env['NO_COLOR'] !== undefined && process.env['NO_COLOR'] !== '') {
    return true;
  }
  if (!process.stdout.isTTY) {
    return true;
  }
  return false;
}

/**
 *
 * @param noColor - When true, forces all color output off (level 0).
 * @returns A chalk instance configured for the current environment
 */
export function createColors(noColor?: boolean): ChalkInstance {
  const disabled = noColor ?? shouldDisableColor();
  if (disabled) {
    return new Chalk({ level: 0 });
  }
  return chalk;
}

let colors: ChalkInstance = createColors();

/**
 * @param enabled - When false, disables all ANSI color output.
 */
export function setColorEnabled(enabled: boolean): void {
  colors = createColors(!enabled);
}

export function getColors(): ChalkInstance {
  return colors;
}

export { colors };
