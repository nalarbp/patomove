#!/bin/bash

# Complete database reset and setup script
echo "🗑️  Resetting database..."

# Navigate to project root (script is in db_demo folder)
cd "$(dirname "$0")/.."

# Step 1: Remove the SQLite database file
rm -f prisma/dev.db
echo "✅ Database file removed"

# Step 2: Recreate the database with fresh schema
npx prisma db push --accept-data-loss
echo "✅ Database recreated with fresh schema"

# Step 3: Generate fresh Prisma client
npx prisma generate
echo "✅ Prisma client regenerated"

# Step 4: Generate demo data (without server dependency)
echo "🌱 Generating demo data..."
cd db_demo
python3 generate_db_demo.py --isolates 50 --output fresh_demo_data.json
echo "✅ Demo data JSON generated (50 samples)"

# Step 5: Start the server temporarily to populate database
echo "🚀 Starting server for data population..."
cd ..
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Step 6: Populate database with generated data
echo "📤 Populating database..."
cd db_demo
python3 generate_db_demo.py --isolates 50 --populate
POPULATE_SUCCESS=$?

# Step 7: Stop the temporary server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

if [ $POPULATE_SUCCESS -eq 0 ]; then
    echo "✅ Database populated successfully (50 samples)"
    echo "🚀 Database ready for development!"
    echo ""
    echo "📊 Summary:"
    echo "   - Fresh SQLite database created"
    echo "   - Schema updated with lowercase standardization" 
    echo "   - 50 demo isolates with genomics-focused workflow"
    echo "   - Priority: normal/priority"
    echo "   - Processing status: to be sequenced → genomics completed"
    echo ""
    echo "🎯 Ready to test Sample Management with new schema!"
else
    echo "❌ Database population failed, but schema is ready"
    echo "💡 You can manually populate later or run the dev server and try again"
fi