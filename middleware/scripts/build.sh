#!/bin/sh

ENVIRONMENT=${NODE_ENV:-development}
echo "Packaging middleware for '$ENVIRONMENT'"
DOTENV_CONFIG_PATH="../.env.$ENVIRONMENT" node --require dotenv/config ./esbuildconfig.cjs

echo "Vanilla middleware prepared in: packaged/middleware.js"
{
    cat packaged/middleware.js
    echo "Object.assign(window, paimaMiddleware.default);"
} > packaged/paimaMiddleware.js
echo "Frontend-ready middleware (globals exported) prepared in: packaged/paimaMiddleware.js"
