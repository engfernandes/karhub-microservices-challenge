#!/bin/sh

set -e

echo "Running Prisma migrations..."

npx prisma migrate deploy

echo "Prisma migrations applied successfully."

echo "Running database seed..."

npx prisma db seed

echo "Database seeded successfully."

exec "$@"