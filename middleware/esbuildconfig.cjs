const { NodeModulesPolyfillPlugin } = require('@esbuild-plugins/node-modules-polyfill');

const modules = NodeModulesPolyfillPlugin();

const define = { global: 'window' };
// To replace process.env calls in middleware with variable values during build time
for (const variable in process.env) {
  define[`process.env.${variable}`] = JSON.stringify(process.env[variable]);
}

const esbuild = require('esbuild');
/** @type import('esbuild').BuildOptions */
const config = {
  // JS output from previous compilation step used here instead of index.ts to have more control over the TS build process
  entryPoints: ['build/index.js'],
  bundle: true,
  format: 'esm',
  define,
  outfile: 'packaged/middleware.js',
  plugins: [modules],
  external: ['pg-native'],
  globalName: 'paimaMiddleware',
  sourcemap: true,
};

esbuild.build(config);
