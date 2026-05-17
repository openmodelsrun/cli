import chalk, { Chalk, type ChalkInstance } from 'chalk';

/**
 * @param noColor - When true, forces all color output off (level 0)
 * @returns A chalk instance with the appropriate color level
 */
export function createColors(noColor?: boolean): ChalkInstance {
  if (noColor) {
    return new Chalk({ level: 0 });
  }
  return chalk;
}

let colors: ChalkInstance = chalk;

/**
 * @param noColor - When true, disables all color output
 */
export function configureColors(noColor: boolean): void {
  colors = createColors(noColor);
}

/**
 * Returns the current module-level chalk instance.
 */
export function getColors(): ChalkInstance {
  return colors;
}

export { colors };
