#!/bin/sh

ENVIRONMENT=${NODE_ENV:-development}
echo "Packaging Middleware for $ENVIRONMENT"
DOTENV_CONFIG_PATH="../.env.$ENVIRONMENT" node --require dotenv/config ./esbuildconfig.cjs
echo "Finished Packaging"

echo "Vanilla Middleware (With Exports) Prepared In: packaged/middleware.js"
head -n $(( $(grep -n '^export {' packaged/middleware.js | head -1 | cut -d: -f1) - 1 )) packaged/middleware.js > packaged/paimaMiddleware.js
echo "Frontend-ready Middleware (Without Exports) Prepared In: packaged/paimaMiddleware.js"
