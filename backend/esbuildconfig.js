import { build } from 'esbuild';

await build({
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

  define: {
    '__dirname': 'import.meta.dirname',
    '__filename': 'import.meta.filename',
  },

  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  }
});
