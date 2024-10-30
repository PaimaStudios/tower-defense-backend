#!/bin/sh
set -eu

ENVIRONMENT=${NODE_ENV:-localhost}
echo "Packaging middleware for '$ENVIRONMENT'"
DOTENV_CONFIG_PATH="../.env.$ENVIRONMENT" node --require dotenv/config ./esbuildconfig.js
