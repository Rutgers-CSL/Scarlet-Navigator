#!/bin/bash

# Start TypeSense container
echo "Starting TypeSense container..."
docker-compose up -d typesense

# Wait for TypeSense to be ready (try for 30 seconds)
echo "Waiting for TypeSense to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8108/health > /dev/null; then
        echo "TypeSense is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "TypeSense failed to start within 30 seconds"
        docker-compose down
        exit 1
    fi
    echo "Waiting... ($i/30)"
    sleep 1
done

# Generate and upload fake courses
echo "Generating fake courses..."
node scripts/typesense/generateCourses.js

echo "Uploading courses to TypeSense..."
node scripts/typesense/uploadCourses.js

# Take down the container
echo "Taking down TypeSense container..."
docker-compose down

echo "Done!"
