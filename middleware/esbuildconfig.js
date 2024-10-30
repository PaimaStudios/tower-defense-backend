import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { build } from 'esbuild';

await build({
  outfile: 'packaged/paimaMiddleware.js',
  // JS output from previous compilation step used here instead of index.ts to have more control over the TS build process
  entryPoints: ['build/index.js'],

  bundle: true,
  format: 'esm',

  minify: true,
  treeShaking: true,
  sourcemap: true,
  // source map is for browser debugging, so include source content
  sourcesContent: true,

  define: {
    global: 'window',
    'process.env': 'PaimaProcessEnv',
  },

  plugins: [NodeModulesPolyfillPlugin()],

  banner: {
    js: "import PaimaProcessEnv from './env.js';",
  },
});
