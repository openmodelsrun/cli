#!/usr/bin/env node
import { checkNodeVersion } from './utils/version-check.js';
import { createProgram } from './cli.js';

checkNodeVersion();

const program = createProgram();
program.parseAsync(process.argv);
