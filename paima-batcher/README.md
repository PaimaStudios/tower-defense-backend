# Paima Batcher

Game input batcher for games created with Paima Engine.

# Usage

In summary, you need to perform the following steps to run the batcher. The rest of the section explains details behind how to achieve them:

1. Prepare an `.env.development` config file,
2. Add your batcher wallet account private key to it,
3. Build the docker image,
4. Run the docker image.

First, ensure you have a config file named `.env.development` ready in the root folder with the configuration you want to use. One approach to do this would be to run the following:

```
cp .env.devnet .env.development
```

One variable that is not set in `.env.devnet` and needs to be set manually in `.env.development` is `BATCHER_PRIVATE_KEY`. This needs to be set to the private key of the wallet intended to be used for posting batched inputs. The wallet needs sufficient funds for posting to the contract. The expected format of the variable is a hex string without the `0x` prefix, e.g. exactly what you get from MetaMask under Account details -> Export private key.

Another environmental variable to pay special attention to is `GAME_INPUT_VALIDATION_TYPE_NAME`, which allows you to specify which game to use the batcher with (currently, only Jugnle Wars is explicitly supported), or to turn off game input validation altogether. As of 2023-02-02, the only valid values are `"catapult"`, specifying Jungle Wars game input validation, and `"no-validation"`, specifying a lack of game input validation altogether (all inputs are assumed to be valid game inputs). Any other values will currently result in no validation being used.

Note that the batcher and postgres ports are currently hardcoded in `Dockerfile` and `docker-compose.yml`, so it is not sufficient to just change them in the `.env` file.

Afterwards, to compile and run the batcher using docker, run the following in the root directory:

```
docker compose build
docker compose up
```

You can also run the batcher without using docker, but for this, you will need an instance of postgres running with a database initialized using [`db/migrations/up.sql`](db/migrations/up.sql) and with its credentials specified in `.env.development`. Once you have this set up, you can run the batcher using the following:

```
npm install
npm run build
npm run dev
```

If you are not using a fresh clone of the repo and want to ensure a clean install, you can also run the `wipe.sh` script beforehand to delete all compiled files and `node_modules`:

```
./wipe.sh
```
