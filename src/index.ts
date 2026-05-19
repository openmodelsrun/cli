#!/usr/bin/env node
import { checkNodeVersion } from './utils/version-check.js';
import { createProgram } from './cli.js';
import { registerCompareCommand } from './commands/compare.js';

checkNodeVersion();

const program = createProgram();
registerCompareCommand(program);
program.parseAsync(process.argv);
