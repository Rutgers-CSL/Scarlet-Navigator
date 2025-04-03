#!/bin/sh

# Default to development if NODE_ENV is not set
if [ -z "$NODE_ENV" ]; then
  NODE_ENV="development"
fi

# Load the appropriate .env file
if [ -f ".env.$NODE_ENV.local" ]; then
  echo "Loading .env.$NODE_ENV.local"
  export $(cat .env.$NODE_ENV.local | grep -v '^#' | xargs)
elif [ -f ".env.$NODE_ENV" ]; then
  echo "Loading .env.$NODE_ENV"
  export $(cat .env.$NODE_ENV | grep -v '^#' | xargs)
else
  echo "Warning: No .env file found for NODE_ENV=$NODE_ENV"
fi

# Execute the command passed to this script
exec "$@"