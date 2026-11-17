#!/bin/sh
set -e

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Seeding Formatio GTM context (idempotent)..."
node scripts/seed-formatio-context.mjs

echo "Starting Quiver on 0.0.0.0:${PORT:-3000}..."
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
