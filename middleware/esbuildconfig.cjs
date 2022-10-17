// import NodeResolve from "@esbuild-plugins/node-resolve";
// import EsmExternals from "@esbuild-plugins/esm-externals";
// import NodeModulesPolyfills from "@esbuild-plugins/node-modules-polyfill";
// import GlobalsPolyfills from "@esbuild-plugins/node-globals-polyfill";
const g = require("@esbuild-plugins/node-globals-polyfill");
const m = require( "@esbuild-plugins/node-modules-polyfill");
const e = ("@esbuild-plugins/esm-externals");
const modules = m.NodeModulesPolyfillPlugin();
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
  define: { global: "window" },
  outfile: "packaged/middleware.js",
  // external: ['electron', 'web3'],
  plugins: [
    global,
    modules
    // NodeModulesPolyfills(),
    // EsmExternals({ externals: ["electron"] }),
  ],
};

esbuild.build(config);
