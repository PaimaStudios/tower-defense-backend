import { build } from 'esbuild';

/** @type import('esbuild').BuildOptions */
const config = {
  // JS output from previous compilation step used here instead of index.ts to have more control over the TS build process
  entryPoints: ['build/index.js'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: 'build/index.bundle.js',

  minify: true,
  treeShaking: true,
  sourcemap: true,
  sourcesContent: false,
};

build(config);
