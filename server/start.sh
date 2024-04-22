#!/bin/bash

set -e

# Configuration
host=db
port=5432
max_attempts=10
delay=5
attempt_num=1

echo "Waiting for PostgreSQL at $host:$port to become available..."

# Wait for PostgreSQL to become available
until pg_isready -h $host -p $port -q || [ $attempt_num -gt $max_attempts ]; do
  echo "PostgreSQL not yet available (attempt $attempt_num)..."
  sleep $delay
  attempt_num=$((attempt_num + 1))
done

if [ $attempt_num -gt $max_attempts ]; then
  echo "Max attempts reached. PostgreSQL not available."
  exit 1
fi

echo "PostgreSQL available. Running Prisma migrations..."

# Run Prisma migrations
npx prisma migrate deploy

echo "Migrations applied successfully."
echo "Starting the application..."

# Start server in dev mode
npm run dev
