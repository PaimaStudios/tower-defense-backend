#!/bin/sh
set -eu

ENVIRONMENT=${NODE_ENV:-localhost}
echo "Packaging middleware for '$ENVIRONMENT'"
DOTENV_CONFIG_PATH="../.env.$ENVIRONMENT" node --require dotenv/config ./esbuildconfig.cjs

echo "Vanilla middleware prepared in: packaged/middleware.js"
cp packaged/middleware.js packaged/paimaMiddleware.js
echo "Frontend-ready middleware (globals exported) prepared in: packaged/paimaMiddleware.js"
