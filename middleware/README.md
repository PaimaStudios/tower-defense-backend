# Tower Defense Middleware

The middleware for the Tower Defense game, which provides a simple API for any frontend to interact with the targeted backend.

## Usage

This package has locally linked dependencies on the `paima-engine` repository -- see [present repository's `README.md`](/README.md) for details.

For a description of the API of the "published" endpoints, which comprise the `default` export of the module, see [the `middleware-endpoints.md` document](/documentation/middleware-endpoints.md), or consult their implementation in the source files inside [the `endpoints` subdirectory](./src/endpoints/).

The "internal" endpoints in [`src/endpoints/internal.ts`](./src/endpoints/internal.ts) are considered experimental and are subject to rapid removal or API changes. Note that these are not included in the `default` export. Everything exported by this module outside the `default` export is intended for internal use only, use at your own risk.

With all library source code available, the package can be directly imported and used -- see the [`test-frontend`](/test-frontend) package for an example.

When integrating into the Unity-based frontend we require the compiled `middleware.js` file which can be produced using the command `npm run build`. Of note, the final `exports` at the end of the output file must be manually commented out/removed before use, in order for the web browsers to accept the `middleware.js` and load it properly.

## Compilation

First, see [the repository's `README.md`](/README.md) to make sure compilation prerequisites are satisfied (e.g. compiling `paima-engine`), and then install and compile the repository from the root directory:

```
npm install
npm run build
```

Before building the middleware, make sure there is a `.env.development` file in the repository's root directory, or set the `NODE_ENV` variable to a value specifying a different config (see [root directory's `README.md`](/README.md) for details.). The simplest way to achieve this is the following (however, make sure that the configuration inside conforms to your expectations):

```
cp .env.test .env.development
```

To finally build the middleware, navigate to this directory and execute the build script:

```
cd middleware
npm run build
```

The compiled middleware should appear in the [packaged](./packaged/) directory.
