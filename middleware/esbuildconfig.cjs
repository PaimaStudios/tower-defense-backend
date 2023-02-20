const g = require("@esbuild-plugins/node-globals-polyfill");
const m = require("@esbuild-plugins/node-modules-polyfill");
const modules = m.NodeModulesPolyfillPlugin();

const define = { global: "window" };
// To replace process.env calls in middleware with variable values during build time
for (const variable in process.env) {
  define[`process.env.${variable}`] = JSON.stringify(process.env[variable]);
}

const global = g.NodeGlobalsPolyfillPlugin({
  process: true,
  buffer: true,
  define: { "process.env.var": '"hello"' }, // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
});
const esbuild = require("esbuild");
const config = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "esm",
  define,
  outfile: "packaged/middleware.js",
  plugins: [global, modules],
};

esbuild.build(config);
