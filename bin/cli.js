#!/usr/bin/env node

import { adapt } from '../index.js';

const args = process.argv.slice(2);

/** @type {import('../index.js').AdapterOptions} */
const options = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--input' || arg === '-i') {
    options.input = args[++i];
  } else if (arg === '--out' || arg === '-o') {
    options.out = args[++i];
  } else if (arg === '--mode' || arg === '-m') {
    const mode = args[++i];

    if (mode !== 'directory' && mode !== 'flat') {
      console.error(`Invalid mode: ${mode}. Must be 'directory' or 'flat'.`);
      process.exit(1);
    }

    options.mode = mode;
  } else if (arg === '--fallback' || arg === '-f') {
    options.fallback = args[++i];
  } else if (arg === '--immutable') {
    options.immutable = args[++i].split(',');
  } else if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  } else if (arg === '--version' || arg === '-v') {
    const pkg = await import('../package.json', { with: { type: 'json' } });
    console.log(pkg.default.version);
    process.exit(0);
  } else if (!arg.startsWith('-')) {
    // Positional argument = input directory
    options.input = arg;
  } else {
    console.error(`Unknown option: ${arg}`);
    printHelp();
    process.exit(1);
  }
}

try {
  await adapt(options);
} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : error);
  process.exit(1);
}

function printHelp() {
  console.log(`
Usage: adapter-static [input] [options]

Build a static site for OpenWorkers.

Arguments:
  input                Input directory (default: dist, build, out, or public)

Options:
  -o, --out <dir>      Output directory (default: dist-openworkers)
  -m, --mode <mode>    Routing mode: 'directory' or 'flat' (default: auto-detect)
  -f, --fallback <f>   SPA fallback file (e.g., /index.html or /200.html)
  --immutable <p>      Comma-separated immutable patterns (e.g., /assets/**,/_app/**)
  -h, --help           Show this help message
  -v, --version        Show version

Examples:
  adapter-static                    # Auto-detect input, output to dist-openworkers
  adapter-static dist -o out        # Build dist/ to out/
  adapter-static --fallback /index.html  # Enable SPA mode
  adapter-static --mode flat        # Use flat routing (/page -> /page.html)
`);
}
