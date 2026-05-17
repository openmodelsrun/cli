/**
 * Node.js version gate.
 * Ensures the CLI runs on Node.js ≥22.0.0.
 */

/**
 * Parses `process.version` and exits with code 1 if the major version is below 22.
 * If the version is sufficient, returns normally (no-op).
 */
export function checkNodeVersion(): void {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0], 10);

  if (major < 22) {
    process.stderr.write(
      `Error: Node.js ≥22.0.0 required (found ${version}).\n`,
    );
    process.exit(1);
  }
}
