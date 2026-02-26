#!/bin/bash

# SkyEnergy Setup Script
# Execute this to setup the initial SkyEnergy database

echo "🚀 SkyEnergy Setup Started"
echo "=========================="

# Check if SUPABASE environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: SUPABASE environment variables not set"
    echo "Please set:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

echo "✅ Environment variables found"

# Run migrations
echo ""
echo "📊 Creating database tables..."
echo "Run the following SQL in Supabase SQL Editor:"
echo ""
echo "File: /scripts/setup-skyenergy.sql"
echo ""
echo "Then run the storage setup:"
echo "File: /scripts/setup-storage.sql"

echo ""
echo "📱 Installation Steps:"
echo "1. Add .env.local variables from Supabase"
echo "2. Run SQL migrations in Supabase Dashboard"
echo "3. Create first HR user (see README for details)"
echo "4. npm run dev"
echo "5. Visit http://localhost:3000"

echo ""
echo "✅ Setup guide complete!"
echo "Check README.md for detailed instructions"
