#!/bin/bash

# Reset database by deleting and recreating
echo "🗑️  Resetting database..."

# Navigate to project root (script is in db_demo folder)
cd "$(dirname "$0")/.."

# Remove the SQLite database file
rm -f prisma/dev.db

echo "✅ Database cleared"

# Recreate the database with schema
npx prisma db push --accept-data-loss

echo "✅ Database recreated with fresh schema"

# Generate fresh Prisma client
npx prisma generate

echo "✅ Prisma client regenerated"

# Optional: Generate demo data (50 samples)
echo "🌱 Generating demo data..."
cd db_demo
python3 generate_db_demo.py --isolates 50 --populate

echo "✅ Demo data populated (50 samples)"
echo "🚀 Database ready for development!"