const { polyfillNode } = require('esbuild-plugin-polyfill-node');
const fs = require('fs');

const define = { global: 'window' };
// To replace process.env calls in middleware with variable values during build time
for (const variable in process.env) {
  define[`process.env.${variable}`] = JSON.stringify(process.env[variable]);
}

if (process.env.SECURITY_NAMESPACE) {
  const namespace = process.env.SECURITY_NAMESPACE;
  if (namespace.endsWith('.yml') || namespace.endsWith('.yaml')) {
    const fileContent = fs.readFileSync(`../${namespace}`, 'utf-8');
    define[`process.env.SECURITY_NAMESPACE_ROUTER`] = JSON.stringify(fileContent);
  }
}

const nodePolyfills = polyfillNode({
  process: true,
  buffer: true,
  polyfills: {
    'fs/promises': true,
  }, // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
});
const esbuild = require('esbuild');
const config = {
  // JS output from previous compilation step used here instead of index.ts to have more control over the TS build process
  entryPoints: ['build/index.js'],
  bundle: true,
  format: 'esm',
  define,
  outfile: 'packaged/middleware.js',
  plugins: [nodePolyfills],
  external: ['pg-native'],
};

esbuild.build(config);
