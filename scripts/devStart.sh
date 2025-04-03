#!/bin/sh

# Load environment variables
source ./scripts/loadEnv.sh

# Start Typesense
docker-compose up -d typesense

cleanup() {
  echo "Stopping Typesense..."
  docker-compose down
}

trap cleanup EXIT

next dev --turbopack