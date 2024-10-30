import { build } from 'esbuild';

await build({
  outfile: 'build/index.bundle.js',
  // JS output from previous compilation step used here instead of index.ts to have more control over the TS build process
  entryPoints: ['build/index.js'],

  bundle: true,
  format: 'esm',
  platform: 'node',

  minify: true,
  treeShaking: true,
  sourcemap: true,
  // source map is just for crash stack traces, so source content isn't needed
  sourcesContent: false,

  define: {
    __dirname: 'import.meta.dirname',
    __filename: 'import.meta.filename',
  },

  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});
