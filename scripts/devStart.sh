#!/bin/sh

docker-compose up -d typesense

cleanup() {
  echo "Stopping Typesense..."
  docker-compose down
}

trap cleanup EXIT

next dev --turbopack