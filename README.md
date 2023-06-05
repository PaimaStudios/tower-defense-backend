<h1 align="center">
  Tower Defense Backend
</h1>
<p align="center">
This repo contains the backend and middleware implementations of TD (aka. Wrath Of The Jungle: Tower Defense).
</p>

# Building

Before building the backend or the middleware, make sure you have `paima-engine` cloned to the same root folder as this repository.

1. `git clone git@github.com:PaimaStudios/paima-engine.git`
2. `git clone git@github.com:PaimaStudios/tower-defense-backend.git`

Secondly, make sure to create your own `.env.development` config file. Most of the commands use that as a fallback, unless explicitly specified otherwise. You can copy the `.env.test` as a starting point and adjust any settings as necessary. `env` files other than the test one are not committed to the repository.

## Configuration

Various `.env` files can be used and are used to configure the various build targets under different circumstances.

Integration testing uses the commited `.env.test` files (see the integration testing compose files &ndash; [new](/integration-testing/config/new/docker-compose.yml) and [old](/integration-testing/config/old/docker-compose.yml)).

Middleware and backend both use `.env.development` by default (which is purposefully not commited to the repository), but will use the file `.env.xxx` for arbitrary `xxx` if the `NODE_ENV` variable is set to `xxx`. To see where this binding happens, see [the docker compose file](/docker/docker-compose.yml) for the backend and [the build script](/middleware/scripts/build.sh) for the middleware.

## Building The Middleware

1. Enter into the `middleware` folder.
2. Run `npm run build`.
3. A `middleware.js` will be the output.

Of note, the final `exports` at the end of the output file must be manually commented out/removed before use, in order for the web browsers to accept the `middleware.js` and load it properly.

## Building And Running The Backend Via Docker

After cloning the two repos to the same root folder, follow these steps to build and run the backend (while automatically deploying a postgres database at the same time) via docker compose:

1. `cp tower-defense-backend/docker/* .`
2. `docker compose up`

Or you can utilize prepared npm scripts `npm run docker` & `npm run docker:build`. For more detailed instructions regarding the docker setup, see the [docker README](/docker/README.md).
To run the backend without docker (not recommended), you must manually set up postgres, create the database with all the tables, compile all dependencies (see what gets built in the [Dockerfile](/docker/Dockerfile)) and run the compiled `index.js` file in the [backend](/backend/) package.
